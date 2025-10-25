# Indoor Navigation System Project Structure

## Frontend (WeChat Mini Program)
- `/frontend`
  - `/pages`
    - `/index` (Home/Wake-up page)
    - `/destination` (Destination selection)
    - `/navigation` (3D visualization & navigation)
    - `/settings` (User settings)
  - `/components`
    - `/voice` (Voice interaction components)
    - `/map` (3D visualization components)
    - `/route` (Route display components)
  - `/utils` (Helper functions)
  - `/services` (API calls to backend)
  - `/assets` (Images, icons, etc.)

## Backend (Python)
- `/backend`
  - `/api` (API endpoints)
    - `main.py` (Main API handler)
    - `voice_api.py` (Voice processing API)
    - `path_api.py` (Path calculation API)
    - `congestion_api.py` (Congestion data API)
  - `/core`
    - `path_finder.py` (Converted C++ pathfinding algorithm)
    - `instruction_parser.py` (User instruction parser)
    - `congestion_processor.py` (Congestion data processor)
    - `model_matcher.py` (3D model path matching)
  - `/db`
    - `models.py` (Database models)
    - `operations.py` (Database operations)
  - `/utils` (Helper functions)
  - `config.py` (Configuration settings)

## Database Schema
- Buildings
- Floors
- Rooms
- Paths (corridors, stairs)
- Users
- NavigationHistory
- FavoriteDestinations
- CongestionData
