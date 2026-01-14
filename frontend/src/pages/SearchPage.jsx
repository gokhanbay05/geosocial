import { useState, useEffect } from "react";
import Input from "../components/core/Input";
import { Search, User } from "lucide-react";
import { searchUsers } from "../services/user.service";
import useDebounce from "../hooks/useDebounce";
import { Avatar, AvatarImage, AvatarFallback } from "../components/core/avatar";
import Spinner from "../components/core/Spinner";
import { getFileUrl } from "../lib/utils";
import { handleError } from "../lib/errorHandler";
import { useProfileStore } from "../store/useProfileStore";
import "../css/pages/SearchPage.css";

export default function SearchPage() {
  const { openProfile } = useProfileStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchResults = async () => {
      if (!debouncedQuery) {
        if (isMounted) setResults([]);
        return;
      }

      if (isMounted) setIsLoading(true);
      try {
        const data = await searchUsers(debouncedQuery, {
          signal: abortController.signal,
        });
        if (isMounted) setResults(data);
      } catch (error) {
        if (error.name !== "CanceledError" && error.name !== "AbortError") {
          handleError(error, { context: "SearchUsers" });
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchResults();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [debouncedQuery]);

  return (
    <div className="search-page-container">
      <div className="search-input-wrapper">
        <Input
          placeholder="Search users..."
          icon={<Search size={18} />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      <div className="search-results-area">
        {isLoading ? (
          <div className="search-loader">
            <Spinner color="primary" />
          </div>
        ) : results.length > 0 ? (
          results.map((user) => (
            <div
              key={user._id}
              className="search-result-item"
              onClick={() => openProfile(user.username)}
            >
              <Avatar className="w-10 h-10 border border-border-default">
                <AvatarImage src={getFileUrl(user.avatarUrl)} />
                <AvatarFallback>{user.username[0]}</AvatarFallback>
              </Avatar>
              <div className="search-result-info">
                <span className="search-result-username">{user.username}</span>
                {user.bio && (
                  <span className="search-result-bio">{user.bio}</span>
                )}
              </div>
            </div>
          ))
        ) : (
          query && (
            <div className="search-empty-state">
              <User size={48} />
              <span>No results found.</span>
            </div>
          )
        )}

        {!query && (
          <div className="search-empty-state">
            <Search size={48} />
            <span>Who are you looking for?</span>
          </div>
        )}
      </div>
    </div>
  );
}