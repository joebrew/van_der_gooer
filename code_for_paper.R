# library(devtools)
# install_github('joebrew/cism')
library(cism)
library(readr)
library(ggplot2)
library(dplyr)
library(maptools)
library(RColorBrewer)
library(rgeos)
library(sp)
library(raster)
library(rgdal)
library(broom)
library(dbscan)

# Read in urban areas
df <- readOGR('data/natural_earth_urban_areas', 
              'ne_10m_urban_areas')
# From http://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-urban-area/

# Nigeria boundary
# nigeria <- readOGR('data/nigeria/',
#                    'NGA_adm0')
nigeria <- readOGR('data/nigeria/',
                   'NGA_adm1')
# nigeria <- getData(name = 'GADM',
#                    country = 'NGA',
#                    level = 1)

# Keep only those urban areas in nigeria
keep_these <- over(df, polygons(nigeria))
df <- df[!is.na(keep_these),]

# Create points within each urban area.
# Use pop density of about 0 - 700 per sq km
# (heavily left skewed)
results_list <- list()
# sampler <- rbeta(1000, 1, 100) * 10000
# for now, using fewer points
sampler <- rbeta(1000, 1, 10) * 100
for (i in 1:nrow(df)){
  message(i)
  multiplier <- sample(sampler, 1)
  the_points <- spsample(df[i,], n = df$area_sqkm[i] * multiplier, type = 'random')
  # Add a column indicating true location
  the_points <- broom::tidy(coordinates(the_points))
  the_points$true_label <- row.names(df)[i]
  the_points$lng <- the_points$x
  the_points$lat <- the_points$y
  results_list[[i]] <- the_points
}
true_locations <- bind_rows(results_list)
coordinates(true_locations) <- ~x+y
proj4string(true_locations) <- proj4string(nigeria)
plot(nigeria)
points(true_locations, pch = '.')

nigeria_df <- tidy(nigeria,
                   region = 'NAME_0')

ggplot(data = nigeria_df) +
  coord_map() +
  geom_polygon(aes(x = long,
                   y = lat,
                   group = group),
               fill = 'white', 
               alpha = 0.6,
               color = 'black') +
  theme_cism() +
  geom_point(data = true_locations@data,
             aes(x = lng,
                 y = lat),
             color = 'darkorange',
             alpha = 0.1)

# Create error dataframes
all_ids <- sort(unique(true_locations$true_label))
for (i in 1:10){
  message(i)
  x <- true_locations
  x$label <- x$true_label
  # Get i percent
  make_errors <- sample(1:nrow(true_locations),
                        round(nrow(true_locations) * (i/100), digits = 0))
  for (j in 1:length(make_errors)){
    while(x$label[make_errors[j]] == x$true_label[make_errors[j]]){
      x$label[make_errors[j]] <- 
        sample(all_ids,
               1)
    }
  }
 
   # Define whether correct or not
  x$correct<- x$label == x$true_label
  
  assign(paste0('errors_', i),
         x)
}


# # Some charts
# close_up <- df[row.names(df) %in% as.character(c(9878, 9879, 9883, 9885, 9887, 9888)),]
# points(true_locations)
# close_locations <- errors_10[errors_10$true_label %in% row.names(close_up),]
# 
# library(mapview)
# mapview::mapview(close_up)
# 
# cols <- rep('darkgreen', length(unique(close_locations$true_label)))
# cols <- adjustcolor(cols, alpha.f = 0.5)
# cols <- cols[as.numeric(factor(close_locations$true_label))]
# cols[!close_locations$correct] <- 'red'
# pchs <- rep(1, length(close_locations$true_label))
# pchs[!close_locations$correct] <- 1
# plot(close_locations, col = cols, pch = pchs, cex = 0.2)

# Define algorithm
brew_scan <- function(label,
                      x,
                      y){
  # Identify convex hulls and remove any points in multiple polygons
  # though potentially correct, these likely bias clusters
  
  # Run knndist to get elbow point for ideal eps
  
  # Run dbscan
  
  # For each point, see if the dbscan cluster number is shared
  # by the other points with that label
  
  # If so, great
  
  # If not, quantify disagreement (%) and re-assign
  
  # Return a vector of corrected labels
  
}

# Actually run algorithm

# EPS should be set as a function of this:
# http://www.sthda.com/english/wiki/dbscan-density-based-clustering-for-discovering-clusters-in-large-datasets-with-noise-unsupervised-machine-learning
# Identify ideal eps
k <- dbscan::kNNdist(as.matrix(errors_1@data[,c('lng', 'lat')]), k =  5)
dbscan::kNNdistplot(as.matrix(errors_1@data[,c('lng', 'lat')]), k =  nrow(df))

x = dbscan::dbscan(errors_1@data[,c('lng', 'lat')],
                   eps = 0.05,
                   minPts = 10)

