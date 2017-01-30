# Returns identicla dataset with one additional column: new_label

library(dplyr)
library(readr)

# Read in testing datasets
testing_data_set_files <- dir('data/testing_data_sets/')
for (i in 1:length(testing_data_set_files)){
  message(paste0('Reading data set number ', i))
  this_file_path <- paste0('data/testing_data_sets/',
                           testing_data_set_files[i])
  this_object <- gsub('.csv', 
                      '', 
                      testing_data_set_files[i],
                      fixed = TRUE)
  assign(this_object,
         data.frame(read_csv(this_file_path)),
         envir = .GlobalEnv)
}

# Define our variation of dbscan

# Define algorithm
brew_scan <- function(label,
                      x,
                      y){
  
  require(dplyr)
  require(sp)
  require(rgeos)
  
  # Delete the below: for testing purposes only
  label = data_set_1$label
  x = data_set_1$x  
  y = data_set_1$y
  
  # Combine the data
  df <- data.frame(x = x,
                   y = y, 
                   lng = x,
                   lat = y,
                   label = label)
  
  # Make spatial version
  df_sp <- df; coordinates(df_sp) <- ~x+y
  proj4string(df_sp) <- CRS("+proj=longlat +ellps=WGS84 +datum=WGS84")
  
  # Run locally weighted spatial regression
  
  # Identify convex hulls and remove any points in multiple polygons
  # though potentially correct, these likely bias clusters
  labels <- sort(unique(df$label))
  results_list <- list()
  counter <- 1
  for (i in 1:length(labels)){
    message(paste0(i, ' of ', length(labels)))
    this_label <- labels[i]
    # Subset the data to only those points with this label
    sub_df_sp <- df_sp[df_sp@data$label == this_label,]
    ch <- rgeos::gConvexHull(sub_df_sp)
    if(i == 1){
      results <- ch
    } else {
      results <- 
        rbind(results,
              ch,
              makeUniqueIDs = TRUE)
    }
    # Add results to a list
    results_list[[i]] <- ch
  }
  # Bind the results together
  combine_together <- function(x){
    rbind(x, makeUniqueIDs = TRUE)
  }
  results <- do.call('combine_together', results_list)
  results <- do.call(rbind, results_list, makeUniqueIDs = TRUE)
  
  # Run knndist to get elbow point for ideal eps
  
  # Run dbscan
  
  # For each point, see if the dbscan cluster number is shared
  # by the other points with that label
  
  # If so, great
  
  # If not, quantify disagreement (%) and re-assign
  
  # Return a vector of corrected labels
  
}
