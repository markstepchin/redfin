import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import PropertyListing from "~/components/Property";
import { api } from "~/utils/api";

import { formatDistance } from "date-fns";

const UserAvatar = ({ className = "" }: { className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1}
    className={clsx("h-11 w-11", className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const PropertyDetails = () => {
  const [comment, setComment] = useState("");
  const router = useRouter();
  const ctx = api.useContext();
  const id =
    typeof router?.query?.id === "string"
      ? parseInt(router?.query?.id || "0")
      : 0;

  const { data: property } = api.property.getPropertyDetail.useQuery(
    {
      propertyId: id,
    },
    {
      enabled: !!router.query.id,
    }
  );

  const { mutate: mutateComment, isLoading: isCommentSaving } =
    api.property.commentOnProperty.useMutation({
      onSuccess: () => {
        if (property?.id) {
          ctx.property.getPropertyDetail.invalidate({
            propertyId: property.id,
          });
        }

        setComment("");
      },
    });

  return property ? (
    <>
      <header className="flex bg-gray-500 px-6 py-4 text-4xl text-white">
        <Link href="/">
          <h1>Red(dit)Fin</h1>
        </Link>
      </header>
      <main className="mt-4 flex flex-col justify-center">
        <section className="mx-auto w-full max-w-screen-md">
          <PropertyListing property={property} showCommentBtn={false} />
        </section>

        <section className="mx-auto w-full max-w-screen-md px-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutateComment({
                commentContent: comment,
                propertyId: property.id,
              });
            }}
          >
            <input
              placeholder="Comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-4 w-full rounded border border-gray-200 px-2 py-1"
              disabled={isCommentSaving}
            />
          </form>

          <h4 className="mb-2 mt-6 font-medium">
            Comments ({property.commentsCount})
          </h4>
          <div className="space-y-4 divide-y">
            {property.comments?.map((c) => (
              <div className="flex pt-3">
                <div className="rounded-full bg-gray-50">
                  <UserAvatar className="stroke-gray-400" />
                </div>
                <div className="ml-3">
                  <div className="text-xs">
                    {formatDistance(new Date(), c.createdAt)} ago
                  </div>{" "}
                  <div>{c.content}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  ) : null;
};

export default PropertyDetails;
