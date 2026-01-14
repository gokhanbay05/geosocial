import { useState, useEffect } from "react";
import { Marker, useMap } from "react-map-gl/maplibre";
import useSupercluster from "use-supercluster";
import { usePostStore } from "../../store/usePostStore";
import CustomMarker from "./CustomMarker";
import { getFileUrl } from "../../lib/utils";

export default function MapMarkers({ data }) {
  const { current: map } = useMap();
  const [bounds, setBounds] = useState(null);
  const [zoom, setZoom] = useState(12);

  const { openCluster, openPostDetail } = usePostStore();

  const points = data.map((post) => ({
    type: "Feature",
    properties: {
      cluster: false,
      postId: post._id,
      ...post,
    },
    geometry: {
      type: "Point",
      coordinates: post.location.coordinates,
    },
  }));

  useEffect(() => {
    if (map) {
      const updateMapInfo = () => {
        const b = map.getBounds();
        setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
        setZoom(map.getZoom());
      };

      updateMapInfo();
      map.on("moveend", updateMapInfo);

      return () => map.off("moveend", updateMapInfo);
    }
  }, [map]);

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom,
    options: { radius: 75, maxZoom: 20 },
  });

  const handleClusterClick = (clusterId) => {
    const leaves = supercluster.getLeaves(clusterId, Infinity);
    const clusterPosts = leaves.map((leaf) => leaf.properties);
    openCluster(clusterPosts);
  };

  return (
    <>
      {clusters.map((cluster) => {
        const [longitude, latitude] = cluster.geometry.coordinates;
        const { cluster: isCluster, point_count: pointCount } =
          cluster.properties;

        if (isCluster) {
          return (
            <Marker
              key={`cluster-${cluster.id}`}
              longitude={longitude}
              latitude={latitude}
              anchor="bottom"
            >
              <CustomMarker
                type="cluster"
                data={pointCount}
                onClick={() =>
                  handleClusterClick(cluster.id, latitude, longitude)
                }
              />
            </Marker>
          );
        }

        return (
          <Marker
            key={cluster.properties.postId}
            longitude={longitude}
            latitude={latitude}
            anchor="bottom"
          >
            <CustomMarker
              type="photo"
              mediaType={cluster.properties.mediaType}
              data={getFileUrl(cluster.properties.mediaUrl)}
              onClick={() => openPostDetail(cluster.properties)}
            />
          </Marker>
        );
      })}
    </>
  );
}
