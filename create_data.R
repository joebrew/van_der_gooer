# Set random number order
set.seed(639)

library(dplyr)
library(rgdal)
library(raster)
library(sp)
library(ggmap)
library(jsonlite)
library(rgeos)
library(maptools)

# Create centroids for our clusters
n_clusters <- 10
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

# Create real data################################

# Get a shapefile for Mozambique
moz <- raster::getData("GADM", country = "MOZ", level = 3)
# Fortify
moz_fortified <- fortify(moz, region = 'NAME_3')

# Generate random points around Manhica
random_points <-
  data.frame(x = runif(n = 1000, min = 32, max = 33),
             y = runif(n = 1000, min = -26, max = -25))
random_points$lng <- random_points$x
random_points$lat <- random_points$y
coordinates(random_points) <- ~x+y

proj4string(random_points) <- proj4string(moz)

# Keep only those points which are in Mozambique
x <- over(random_points, polygons(moz))
random_points <- random_points[!is.na(x),]

# Keep only those polygons which are reevant
sub_moz <- moz[sort(unique(x)),]
sub_moz_fortified <- fortify(sub_moz, region = 'NAME_3')


# Plot
plot(sub_moz)
points(random_points, 
       pch = 16, #'.',
       col = adjustcolor('darkred', alpha.f = 0.8))

# Get from google more information on each location
if('google.RData' %in% dir()){
  load('google.RData')
} else {
  google <- list()
  for (i in 1:length(random_points)){
    message(paste0(i, ' of ', length(random_points)))
    this_point <- coordinates(random_points[i,])
    google[[i]] <- 
      revgeocode(this_point,
                 output = 'all',
                 messaging = TRUE)
  }
  save(google,
       file = 'google.RData')
}

# Extract the location
locations <- 
  unlist(lapply(google, function(x){
    address_components <- x$results[[1]]$address_components
    if(length(address_components) == 4){
      address_components[[2]]$long_name
    } else {
      NA
    }
  }))

# Add the locations to the spatialpointsdataframe
random_points@data$location <- 
  locations

# Plot with color by location
ggplot() +
  geom_polygon(data = sub_moz_fortified,
               aes(x = long,
                   y = lat,
                   group = group),
               fill = 'black',
               color = 'white') +
  coord_map() +
  geom_point(data = random_points@data %>%
               filter(!is.na(location)),
             aes(x = lng,
                 y = lat,
                 col = location),
             size = 1) +
  theme_bw() + 
  theme(
    panel.grid = element_blank()
  ) +
  theme(panel.background = element_rect(fill = grey(0.2), colour = 'darkgrey'))


# Run
library(dbscan)


# EPS should be set as a function of this:
# http://www.sthda.com/english/wiki/dbscan-density-based-clustering-for-discovering-clusters-in-large-datasets-with-noise-unsupervised-machine-learning
x = dbscan::dbscan(all_points[,c('x', 'y')],
           eps = 0.5,
           minPts = 5)
par(mfrow = c(1,2))
plot(all_points$x,
     all_points$y,
     col = rainbow(length(unique(all_points$cluster)))[all_points$cluster])

plot(all_points$x,
     all_points$y,
     col = rainbow(length(unique(x$cluster)))[x$cluster])
par(mfrow = c(1,1))