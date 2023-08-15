import { useState } from "react";
import Property from "~/components/Property";
import { api } from "~/utils/api";

const PAGE_SIZE = 20;

export default function Home() {
  const [pageNumber, setPageNumber] = useState(1);

  const [sort, setSort] = useState<{
    orderbyDirection: string;
    orderbyField: string;
  }>({ orderbyDirection: "", orderbyField: "" });
  const [state, setState] = useState("");

  const { data, isLoading } = api.property.getAll.useQuery({
    pageNumber: pageNumber,
    pageSize: PAGE_SIZE,
    state,
    orderByDirection: sort.orderbyDirection,
    orderByField: sort.orderbyField,
  });

  return (
    <>
      <header className="flex bg-gray-500 px-6 py-4 text-4xl text-white">
        <h1>Red(dit)Fin</h1>
      </header>
      <main>
        <section className="mx-auto mt-12 max-w-screen-md">
          <div className="flex justify-between">
            <label>
              Filter by State:
              <input
                placeholder="CA, WA, MA, etc."
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="ml-2 border border-gray-200 p-2"
              />
            </label>
            <label>
              Sort By
              <select
                className="ml-2 border border-gray-200 p-2"
                onChange={(e) => {
                  if (e.target.value === "0") {
                    setSort({
                      orderbyDirection: "desc",
                      orderbyField: "likesCount",
                    });
                  } else if (e.target.value === "1") {
                    setSort({ orderbyDirection: "asc", orderbyField: "price" });
                  } else if (e.target.value === "2") {
                    setSort({
                      orderbyDirection: "desc",
                      orderbyField: "price",
                    });
                  }
                }}
              >
                <option>select one</option>
                <option value={0}>Likes</option>
                <option value={1}>Price (Low to High)</option>
                <option value={2}>Price (High to Low)</option>
              </select>
            </label>
          </div>

          <div className="mb-2 mt-12">
            <i>Total: {data?.totalCount}</i>
          </div>
          <div className="space-y-4 ">
            {isLoading ? (
              <>Loading...</>
            ) : (
              data?.properties.map((p) => (
                <div className="shadow">
                  <Property property={p} key={p.id} showCommentBtn={true} />
                </div>
              ))
            )}
          </div>

          <div className="mb-12 mt-4 flex space-x-4">
            {pageNumber !== 1 && (
              <button
                className="flex w-40 justify-center rounded-3xl bg-gray-100 p-2"
                onClick={() => setPageNumber(pageNumber - 1)}
                disabled={pageNumber === 1}
              >
                Previous Page
              </button>
            )}

            <button
              className="flex w-40 justify-center rounded-3xl bg-gray-100 p-2"
              onClick={() => setPageNumber(pageNumber + 1)}
              disabled={
                data?.properties?.length
                  ? data?.properties?.length < PAGE_SIZE
                  : true
              }
            >
              Next Page
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
