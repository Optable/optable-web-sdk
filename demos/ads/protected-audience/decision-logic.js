function scoreAd(adMetadata, bid, auctionConfig, trustedScoringSignals, browserSignals) {
  return { desirability: bid * 100000, bid, allowComponentAuction: true };
}

function reportResult() {
}
