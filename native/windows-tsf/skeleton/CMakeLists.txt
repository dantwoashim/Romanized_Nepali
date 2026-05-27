cmake_minimum_required(VERSION 3.20)
project(LekhTextServicePlaceholder LANGUAGES CXX)

# Scaffold only. This target is intentionally not wired into npm verification.
add_library(LekhTextServicePlaceholder SHARED LekhTextService.placeholder.cpp)
target_compile_features(LekhTextServicePlaceholder PRIVATE cxx_std_20)
