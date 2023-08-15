import { Property } from "@prisma/client";
import { api } from "~/utils/api";
import clsx from "clsx";
import { useRouter } from "next/router";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const UpIcon = ({ className = "" }: { className: string }) => (
  <svg
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke=""
    className={`h-4 w-4 ${className}`}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75"
    />
  </svg>
);

const DownIcon = ({ className = "" }: { className: string }) => (
  <svg
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke=""
    className={clsx("h-4 w-4", className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
    />
  </svg>
);

const ChatIcon = ({ className = "" }: { className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={`h-6 w-6 ${className}`}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
    />
  </svg>
);

const PropertyListing = ({
  property,
  showCommentBtn = false,
}: {
  property: Property;
  showCommentBtn: boolean;
}) => {
  const router = useRouter();
  const ctx = api.useContext();

  const { mutate: mutateLike, isLoading: isLikeLoading } =
    api.property.likeProperty.useMutation({
      onSuccess: () => {
        void ctx.property.getAll.invalidate();
        void ctx.property.getPropertyDetail.invalidate({
          propertyId: property.id,
        });
      },
    });

  const { mutate: mutateDislike, isLoading: isDislikeLoading } =
    api.property.dislikeProperty.useMutation({
      onSuccess: () => {
        void ctx.property.getAll.invalidate();
        void ctx.property.getPropertyDetail.invalidate({
          propertyId: property.id,
        });
      },
    });

  return (
    <div className="rounded px-6 py-4">
      <div className="flex justify-between">
        <div className="text-lg">{formatter.format(property.price)}</div>

        <div className="flex space-x-3">
          {showCommentBtn && (
            <button
              className="group flex space-x-2 rounded-3xl bg-gray-100 p-2 pr-4 hover:bg-gray-200"
              onClick={() => void router.push(`/${property.id}`)}
            >
              <ChatIcon className="stroke-gray-900 group-hover:stroke-blue-700" />{" "}
              <div className="group-hover:text-blue-700">
                {property.commentsCount}
              </div>
            </button>
          )}

          <div className="flex items-center space-x-2 rounded-3xl bg-gray-100">
            <button
              className={clsx(
                "group rounded-full p-2 hover:bg-gray-200",
                (isLikeLoading || isDislikeLoading) && "cursor-not-allowed"
              )}
              onClick={() => mutateLike({ propertyId: property.id })}
              disabled={isLikeLoading || isDislikeLoading}
            >
              <UpIcon className="stroke-gray-700 group-hover:stroke-blue-700" />
            </button>
            <div>{property.likesCount}</div>

            <button
              className={clsx(
                "group rounded-full p-2 hover:bg-gray-200",
                (isLikeLoading || isDislikeLoading) && "cursor-not-allowed"
              )}
              onClick={() => mutateDislike({ propertyId: property.id })}
              disabled={isLikeLoading || isDislikeLoading}
            >
              <DownIcon className="stroke-gray-700 group-hover:stroke-blue-700" />
            </button>
          </div>
        </div>
      </div>

      <div className="my-1 text-sm text-gray-500">
        {property.beds} beds {property.baths} baths {property.square_feet} sqft
      </div>
      <div className="flex justify-between text-sm">
        <div>
          {property.address}, {property.city} {property.state}, {property.zip}
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-400">{property.description}</div>
    </div>
  );
};

export default PropertyListing;
