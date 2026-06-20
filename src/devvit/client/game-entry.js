window.SIGNAL_GARDEN_MANUAL_START = true;

const [{ createFetchCommunityClient }, { startSignalGarden }] = await Promise.all([
  import("../../client/communityClient.js"),
  import("../../main.js"),
]);

startSignalGarden({
  communityClient: createFetchCommunityClient({
    baseUrl: window.location.origin,
  }),
});
