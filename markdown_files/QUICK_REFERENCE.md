# Quick Reference - Draft Jobs Module

## 🚀 Run Tests

```bash
# Check Docker is running
docker ps

# Run all draft job tests
docker exec nest_server npm test -- --runInBand test/draft-job

# Run specific test
docker exec nest_server npm test -- --runInBand test/draft-job.frontend-flow.spec.ts
```

## 📁 Key Files

### Backend
- **Module**: `src/modules/draft-job/`
- **Entity**: `draft-job.entity.ts`
- **Service**: `draft-job.service.ts`
- **Controller**: `draft-job.controller.ts`
- **Tests**: `test/draft-job.*.spec.ts`

### Frontend
- **API Client**: `admin_panel/UdaanSarathi2/src/services/draftJobApiClient.js`
- **Data Mapper**: `admin_panel/UdaanSarathi2/src/services/draftJobMapper.js`
- **Job Service**: `admin_panel/UdaanSarathi2/src/services/jobService.js`
- **Wizard**: `admin_panel/UdaanSarathi2/src/components/JobDraftWizard.jsx`
- **Drafts Page**: `admin_panel/UdaanSarathi2/src/pages/Drafts.jsx`

## 🔗 API Endpoints

```
GET    /agencies/:license/draft-jobs           # List drafts
POST   /agencies/:license/draft-jobs           # Create draft
GET    /agencies/:license/draft-jobs/:id       # Get draft
PATCH  /agencies/:license/draft-jobs/:id       # Update draft
DELETE /agencies/:license/draft-jobs/:id       # Delete draft
POST   /agencies/:license/draft-jobs/:id/validate   # Validate
POST   /agencies/:license/draft-jobs/:id/publish    # Publish
```

## 📊 8-Step Wizard Flow

| Step | Name | Key Fields |
|------|------|------------|
| 0 | Administrative Details | lt_number, chalani_number, dates, announcement_type |
| 1 | Contract Terms | period_years, hours, days, overtime, benefits |
| 2 | Positions | title, vacancies, salary, currency |
| 3 | Tags & Requirements | skills, education, experience |
| 4 | Expenses | medical, insurance, travel, visa, training, welfare |
| 5 | Cutout Upload | file_name, file_url, is_uploaded |
| 6 | Review | reviewed flag |
| 7 | Submit | is_complete, ready_to_publish |

## 🔄 Draft Status Flow

```
draft → ready_to_publish → published
```

## 💾 Progress Tracking Fields

- `is_partial`: Boolean - Draft is incomplete
- `last_completed_step`: Number (0-7) - Last completed wizard step
- `is_complete`: Boolean - All required fields filled
- `ready_to_publish`: Boolean - Ready for publishing
- `reviewed`: Boolean - User reviewed the draft
- `status`: Enum - draft | ready_to_publish | published

## 🎯 Field Mapping (Frontend ↔ Backend)

| Frontend | Backend |
|----------|---------|
| `title` | `posting_title` |
| `company` | `employer.company_name` |
| `positions[].position_title` | `positions[].title` |
| `positions[].vacancies_male` | `positions[].vacancies.male` |
| `positions[].monthly_salary` | `positions[].salary.monthly_amount` |
| `tags` | `skills` |
| `requirements` | `education_requirements` |

## 🧪 Test Commands

```bash
# Basic CRUD tests
docker exec nest_server npm test -- --runInBand test/draft-job.create-and-publish.spec.ts

# Frontend flow tests
docker exec nest_server npm test -- --runInBand test/draft-job.frontend-flow.spec.ts

# All tests
docker exec nest_server npm test

# With verbose output
docker exec nest_server npm test -- --verbose
```

## 🐛 Debug Commands

```bash
# View logs
docker logs nest_server

# Access container
docker exec -it nest_server sh

# Check database
docker exec -it nest_pg psql -U postgres -d app_db

# Restart containers
docker-compose restart
```

## 📝 Memory Queries

```bash
# In future sessions, ask Angier:
"Show me the draft jobs testing workflow"
"How do I run draft job tests?"
"What are the draft job API endpoints?"
"Explain the 8-step wizard flow"
```

## ✅ Checklist for New Features

- [ ] Update entity (`draft-job.entity.ts`)
- [ ] Update DTOs (`create-draft-job.dto.ts`, `update-draft-job.dto.ts`)
- [ ] Update service logic (`draft-job.service.ts`)
- [ ] Add/update tests (`test/draft-job.*.spec.ts`)
- [ ] Run tests: `docker exec nest_server npm test`
- [ ] Update frontend mapper (`draftJobMapper.js`)
- [ ] Test API integration
- [ ] Update documentation

## 🎓 Learning Resources

- **Testing Guide**: `TESTING_GUIDE.md`
- **Integration Guide**: `admin_panel/UdaanSarathi2/DRAFT_API_INTEGRATION.md`
- **Backend Tests**: `test/draft-job.*.spec.ts` (read for examples)
- **Frontend Wizard**: `admin_panel/UdaanSarathi2/src/components/JobDraftWizard.jsx`
