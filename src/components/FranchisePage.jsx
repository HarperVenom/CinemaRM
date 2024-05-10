import Filter from "./Filter";
import List from "./List";
import Map from "./Map";

const Page = ({ universe, loading, error }) => {
  return (
    <div className="page">
      <h1>{universe.title}</h1>
      {universe && <Map universe={universe}></Map>}
    </div>
  );
};

export default Page;
