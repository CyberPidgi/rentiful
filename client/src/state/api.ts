import { cleanParams, createNewUserInDatabase } from "@/lib/utils";
import { Manager, Property, Tenant } from "@/types/prismaTypes";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import { FiltersState } from ".";

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async (headers) => {
      const session = await fetchAuthSession();
      const { idToken } = session.tokens ?? {};

      if (idToken) {
        headers.set("Authorization", `Bearer ${idToken}`);
      }

      return headers;
    },
  }),
  reducerPath: "api",
  tagTypes: ["Managers", "Tenants", "Properties"],
  endpoints: (build) => ({
    getAuthUser: build.query<User, void>({
      queryFn: async (_, _queryApi, _extraOptions, fetchWithBQ) => {
        try {
          const session = await fetchAuthSession();
          const { idToken } = session.tokens ?? {};
          const user = await getCurrentUser();
          const userRole = idToken?.payload["custom:role"] as string;

          const endpoint =
            userRole === "manager"
              ? `/managers/${user.userId}`
              : `/tenants/${user.userId}`;

          let userDetails = await fetchWithBQ(endpoint);

          // if user doesnt exist, create a new user
          if (userDetails.error && userDetails.error.status === 404) {
            userDetails = await createNewUserInDatabase(
              user,
              idToken,
              userRole as "tenant" | "manager",
              fetchWithBQ
            );
          }

          return {
            data: {
              cognitoInfo: { ...user },
              userInfo: userDetails.data as Tenant | Manager,
              userRole: userRole as "tenant" | "manager",
            },
          };
        } catch (error: any) {
          return {
            error: error.message || "Failed to fetch user details",
          };
        }
      },
    }),

    // manager related endpoints
    updateManager: build.mutation<
      Manager,
      Partial<Manager> & { cognitoId: string }
    >({
      query: ({ cognitoId, ...updatedManager }) => ({
        url: `/managers/${cognitoId}`,
        method: "PUT",
        body: {
          name: updatedManager.name,
          email: updatedManager.email,
          phoneNumber: updatedManager.phoneNumber,
        },
      }),
      invalidatesTags: (result) => [{ type: "Managers", id: result?.id }],
    }),

    // Property related endpoints
    getProperties: build.query<
      Property[],
      Partial<FiltersState> & { favoriteIds?: number[] }
    >({
      query: (filters) => {
        const params = cleanParams({
          location: filters.location,
          priceMin: filters.priceRange?.[0],
          priceMax: filters.priceRange?.[1],
          squareFeetMin: filters.squareFeet?.[0],
          squareFeetMax: filters.squareFeet?.[1],
          latitude: filters.coordinates?.[1],
          longitude: filters.coordinates?.[0],
          beds: filters.beds,
          baths: filters.baths,
          favoriteIds: filters.favoriteIds?.join(","),
          availableFrom: filters.availableFrom,
          amenities: filters.amenities?.join(","),
          propertyType: filters.propertyType,
        });

        return {
          url: "properties",
          params: params,
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Properties" as const, id })),
              { type: "Properties", id: "LIST" },
            ]
          : [{ type: "Properties", id: "LIST" }],
    }),

    // tenant related endpoints
    updateTenant: build.mutation<
      Tenant,
      Partial<Tenant> & { cognitoId: string }
    >({
      query: ({ cognitoId, ...updatedTenant }) => ({
        url: `/tenants/${cognitoId}`,
        method: "PUT",
        body: {
          name: updatedTenant.name,
          email: updatedTenant.email,
          phoneNumber: updatedTenant.phoneNumber,
        },
      }),
      invalidatesTags: (result) => [{ type: "Tenants", id: result?.id }],
    }),

    addFavoriteProperty: build.mutation<
      Tenant,
      { cognitoId: string; propertyId: number }
    >({
      query: ({ cognitoId, propertyId }) => ({
        url: `/tenants/${cognitoId}/favorites/${propertyId}`,
        method: "POST",
      }),
      invalidatesTags: (result) => [
        { type: "Tenants", id: result?.id },
        { type: "Properties", id: "LIST" },
      ],
    }),

    removeFavoriteProperty: build.mutation<
      Tenant,
      { cognitoId: string; propertyId: number }
    >({
      query: ({ cognitoId, propertyId }) => ({
        url: `/tenants/${cognitoId}/favorites/${propertyId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result) => [
        { type: "Tenants", id: result?.id },
        { type: "Properties", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAuthUserQuery,
  useUpdateTenantMutation,
  useUpdateManagerMutation,
  useGetPropertiesQuery,
  useAddFavoritePropertyMutation,
  useRemoveFavoritePropertyMutation,
  
} = api;
