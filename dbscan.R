dbscan <- function(D, eps, MinPts) {
  C <- 0
  # Establish visit log
  visit_log <- rep(FALSE, nrow(D))
  # Establish a noise log
  noise_log <- rep(FALSE, nrow(D))
  for (i in 1:nrow(D)){
    # Extract the point
    P <- D[i,]
    # Only keep going if not already visited
    if(!visit_log[i]){
      # Get the neighborhood points
      NeighborPts = regionQuery(P = P, 
                                eps = eps,
                                dataset = dataset)
      # Is it big enough to use?
      if(nrow(NeighborPts) < MinPts){
        noise_log[i] <- TRUE
      } else {
        C <- C + 1
        expandCluster(P = P, 
                      NeighborPts = NeighborPts, 
                      C = C, 
                      eps = eps, 
                      MinPts = MinPts,
                      i = i,
                      dataset = dataset)
      }
    }
  }
}

expandCluster <- function(P, NeighborPts, C, eps, MinPts, i, dataset) {
  # add P to cluster C
  P$cluster <- C
  for (P1 in 1:nrow(NeighborPts)){
    if(!visit_log[i]){
      visit_log[i] <- TRUE
      NeighborPts1 <- regionQuery(P = NeighborPts[P1,], 
                                  eps = eps,
                                  dataset = dataset)
      if(nrow(NeighborPts1) >= MinPts){
        NeighborPts <- rbind(NeighborPts,
                             NeighborPts1)
        # Remove duplicates
        NeighborPts <- 
          NeighborPts %>%
          group_by(x,y) %>%
          mutate(dummy = cumsum(1)) %>%
          ungroup %>%
          filter(dummy == 1) %>%
          dplyr::select(-dummy)
  
      }
      if(is.na(NeighborPts[P1,]$cluster)){
        # This needs to be added in the parent dataset
        NeighborPts[P1,]$cluster <- C
      }
    }
  }
}
  
regionQuery <- function(P, eps, dataset){
  # Get distance between p and all other points
  euclidean_distance <- function(x1, x2) sqrt(abs((x1 - x2) ^ 2))
  distances <- apply(dataset, 1, function(x){
    as.numeric(sqrt(euclidean_distance(P$x, x['x']) +
           euclidean_distance(P$y, x['y'])))})
    return(dataset[distances < eps,])
}
