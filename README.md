The API for planner.cis.udel.edu

There is one thing that is not fully functional, but would be great:
  - Fully flesh out how technical electives, concentration electives, breadth requirements, etc are handled with the "Users Classes" tabs and how it matches with electives and breadth requirements in the concentration plans
    - Currently, it is reliant on what the data looks like in terms of class names for electives and breadth requirements. This is a hacky solution that will not work when data for these class names does not exactly match an expected value. For example, concentration electives need to be numbered sequentially like Concentration Elective 1, Concentration Elective 2, etc.

Additionally:
  - Code refactoring would be nice so that all of the API endpoints are not in one file, which can cause some confusion.
