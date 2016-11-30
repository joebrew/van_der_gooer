library(dplyr)

# Create centroids for our clusters
n_clusters <- 3
results_list <- list()
for (i in 1:n_clusters){
  centroids <- data.frame(x = sample(1:10, 1),
                          y = sample(1:10, 1))
  results_list[[i]] <- centroids
}
centroids <- do.call('rbind', results_list)

# Create points for our clusters
results_list <- list()
for (i in 1:nrow(centroids)){
  this_centroid <- centroids[i,]
  these_points <- data.frame(x = rnorm(mean = this_centroid$x,
                                       n = 100,
                                       sd = 0.3),
                             y = rnorm(mean = this_centroid$y,
                                       n = 100,
                                       sd = 0.3),
                             cluster = i)
  results_list[[i]] <- these_points
}
all_points <- do.call('rbind', results_list)

# Source
# source('dbscan.R')

# Run
dbscan(D = all_points,
       eps = 2,
       MinPts = 10)

library(dbscan)
# EPS should be set as a function of this:
# http://www.sthda.com/english/wiki/dbscan-density-based-clustering-for-discovering-clusters-in-large-datasets-with-noise-unsupervised-machine-learning
x = dbscan::dbscan(all_points[,c('x', 'y')],
           eps = 2,
           minPts = 5)
par(mfrow = c(1,2))
plot(all_points$x,
     all_points$y,
     col = rainbow(3)[all_points$cluster])

plot(all_points$x,
     all_points$y,
     col = rainbow(length(unique(x$cluster)))[x$cluster])
par(mfrow = c(1,1))