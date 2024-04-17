import Map from "../components/Map";
import useFetch from "../data/useFetch";

const Root = () => {
  const [universes, loading, error] = useFetch("/api/universes");

  return (
    <div className="root">
      {universes ? (
        loading ? (
          <div>Lading...</div>
        ) : error ? (
          <div>Error: {error.message}</div>
        ) : (
          <Map universe={universes[0]} loading={loading} error={error} />
        )
      ) : null}
    </div>
  );
};

export default Root;
