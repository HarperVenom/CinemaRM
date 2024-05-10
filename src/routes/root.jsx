import Page from "../components/FranchisePage";
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
          <Page universe={universes[0]} loading={loading} error={error}></Page>
        )
      ) : null}
    </div>
  );
};

export default Root;
