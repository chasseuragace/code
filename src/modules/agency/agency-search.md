# Agency Search API

## Overview
This document outlines the API endpoint for searching agencies with a simplified keyword-based search that searches across multiple fields, along with pagination and sorting capabilities.

## Request

### Endpoint
`GET /agencies/search`

### Query Parameters
| Parameter | Type    | Required | Default | Description                          |
|-----------|---------|----------|---------|--------------------------------------|
| keyword   | string  | No       | ""      | Search term to look up agencies by name, description, location, or specializations |
| page      | number  | No       | 1       | Page number for pagination (min: 1)  |
| limit     | number  | No       | 10      | Number of items per page (1-100)     |
| sortBy    | string  | No       | name    | Field to sort by (name, country, city, created_at) |
| sortOrder | string  | No       | asc     | Sort order (asc/desc)                |

### Search Behavior
- The search is case-insensitive
- The keyword searches across these fields:
  - Agency name
  - License number
  - Description
  - City
  - Country
  - Specializations (array)
  - Target countries (array)
- Only active agencies are returned by default

## Response

### Success Response (200)
```typescript
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "license_number": "string",
      "logo_url": "string | null",
      "description": "string | null",
      "city": "string | null",
      "country": "string | null",
      "website": "string | null",
      "is_active": "boolean",
      "specializations": "string[] | null"
    }
  ],
  "meta": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number"
  }
}
```

### Error Responses
- `400 Bad Request`: Invalid query parameters
- `500 Internal Server Error`: Server error

## Implementation Notes
- Search is implemented using SQL ILIKE with wildcards for case-insensitive matching
- Pagination uses offset/limit with a maximum of 100 items per page
- Sorting is performed at the database level for efficiency
- Only active agencies are included in search results
- Special characters in search terms are properly escaped

## Example Request
```
GET /agencies/search?keyword=tech&page=1&limit=10&sortBy=country&sortOrder=asc
```

## Example Response
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Tech Solutions Nepal",
      "license_number": "TECH-12345",
      "logo_url": "https://example.com/logos/tech-solutions.png",
      "description": "Leading IT recruitment agency in Nepal specializing in tech placements",
      "city": "Kathmandu",
      "country": "Nepal",
      "website": "https://techsolutions.com.np",
      "is_active": true,
      "specializations": ["IT", "Software Development", "Cloud Computing"]
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

## Future Enhancements
1. Add support for advanced search operators
2. Implement full-text search with ranking
3. Add geolocation-based search with distance filtering
4. Include agency performance metrics
5. Add support for filtering by multiple specializations
