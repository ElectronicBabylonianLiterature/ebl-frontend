# Implementation Strategy: PCA Clustering for Sign Display

## Executive Summary

**Objective:** Refactor sign display to use PCA clustering data with lazy loading for improved performance.

**Key Decisions:**

- ✅ **Backend filtering:** API provides filtered endpoints (`centroids_only`, cluster-specific)
- ✅ **Layout:** Table-based structure (centroid in left column, variants in right)
- ✅ **Initial state:** All accordions closed; only centroid data loaded
- ✅ **Lazy loading:** Variants load on accordion expansion
- ✅ **Error handling:** Graceful degradation with partial data display
- ✅ **Sorting:** Chronological within variants (dated first, undated last)

**Estimated Effort:** 3-5 days

**Performance Gain:** 80-90% reduction in initial page load payload

---

## Overview

Refactor the sign display component to use PCA clustering data for improved performance through lazy loading. By default, only centroid signs are loaded; related variants are loaded on-demand when users expand accordions.

### Data Flow

```
Initial Page Load:
  GET /signs/{signName}/images?centroids_only=true
    ↓
  Group centroids by period/script
    ↓
  Render closed accordions (one per period)

User Clicks Accordion (e.g., "Neo-Assyrian"):
  GET /signs/{signName}/images/cluster/{clusterId}?script=NA (for each cluster)
    ↓
  Group results by form/variant
    ↓
  Render tables:
    - Left column: Centroid
    - Right column: Variants (chronologically sorted)
```

---

## 1. Data Model Updates

### 1.1 Update `CroppedAnnotation` Interface

**File:** `src/signs/domain/CroppedAnnotation.ts`

Add PCA clustering properties to align with backend schema:

```typescript
export interface PcaClustering {
  clusterId: string
  clusterRank: number
  form: string
  isCentroid: boolean
  clusterSize: number
  isMain: boolean
}

export interface CroppedAnnotation {
  image: base64String
  fragmentNumber: string
  provenance?: string
  script: string
  label: string
  date?: MesopotamianDate
  annotationId: string // NEW: from backend
  pcaClustering?: PcaClustering // NEW: optional clustering data
}
```

**Rationale:** Matches Python backend schema (`PcaClustering` class and `Annotation` with `pca_clustering` field).

---

## 2. API Layer Updates

### 2.1 Add New SignService Method

**File:** `src/signs/application/SignService.ts`

Add method to fetch centroid images only:

```typescript
getCentroidImages(signName: string): Bluebird<CroppedAnnotation[]>
```

Add method to fetch variants for a specific cluster:

```typescript
getClusterVariants(
  signName: string,
  clusterId: string,
  script: string
): Bluebird<CroppedAnnotation[]>
```

### 2.2 Update SignRepository

**File:** `src/signs/infrastructure/SignRepository.ts`

Add corresponding repository methods:

```typescript
getCentroidImages(signName: string): Promise<CroppedAnnotation[]> {
  return this.apiClient
    .fetchJson(`/signs/${encodeURIComponent(signName)}/images?centroids_only=true`, false)
    .then(this.processCroppedAnnotations)
}

getClusterVariants(
  signName: string,
  clusterId: string,
  script: string
): Promise<CroppedAnnotation[]> {
  return this.apiClient
    .fetchJson(
      `/signs/${encodeURIComponent(signName)}/images/cluster/${clusterId}?script=${script}`,
      false
    )
    .then(this.processCroppedAnnotations)
}

private processCroppedAnnotations(annotations: CroppedAnnotation[]): CroppedAnnotation[] {
  return annotations.map((annotation) => {
    if (!_.isEmpty(annotation.date)) {
      annotation.date = MesopotamianDate.fromJson(annotation.date)
    } else {
      annotation.date = undefined
    }
    return annotation
  })
}
```

**Alternative:** If backend cannot support filtered endpoints, fetch all annotations and filter client-side (less optimal for performance).

---

## 3. Component Architecture

### 3.1 New Component Structure - TABLE-BASED LAYOUT

Create new components for better separation of concerns:

```
SignImages.tsx (existing - update to use new structure)
├── SignImagePagination (existing - refactor)
│   └── PeriodAccordion (new)
│       └── VariantGroup (new) - Uses Table layout
│           └── SignImageCell (refactor from SignImage) - Table cell content
```

**Key Design Change:** Using Table layout instead of card grid, with centroids in left column and variants in right column.

### 3.2 Component Responsibilities

#### `SignImages.tsx`

- Fetch centroid-only data on initial load
- Pass down to `SignImagePagination`
- Handle loading states

#### `SignImagePagination`

- Group centroids by script/period
- Manage period accordions
- Track which periods are expanded

#### `PeriodAccordion` (NEW)

- Represent one period (MA, NA, etc.)
- Lazy-load variants when accordion is opened
- Group centroids by cluster/variant (form)
- Sort within each variant by date

#### `VariantGroup` (NEW)

- Display all signs for a specific variant/form in table structure
- Show form/variant name (e.g., "canonical1", "canonical2")
- Render two-column table: centroid in left, variants in right
- Sort variant signs chronologically (dated first, undated last)
- Apply visual distinction to centroid (highlighting)

#### `SignImageCell`

- Display individual sign image within table cell
- Show fragment number, date, provenance, label
- Visual distinction for centroid vs variant
- Optimized for table layout (not card grid)

---

## 4. Detailed Component Implementation

### 4.0 Initial Display Behavior

**Default State (Before Any Accordion Opened):**

- All period accordions are **closed**
- Only centroid data is loaded (via `getCentroidImages` API call)
- Centroids are not visible until accordion is expanded
- Fast initial page load due to minimal data fetch

**After Clicking Accordion Header:**

- Lazy-load all variants and examples for that period
- Display centroids, variants, and examples organized by form in table layout
- Each form shows centroid in left column, variants in right column
- Chronologically sorted by date (dated first, undated last)

### 4.1 SignImages Component Update

**Initial Load Strategy:** Fetch only centroids to populate period accordions

```typescript
export default withData<
  WithoutData<Props>,
  { signName: string; signService: SignService },
  CroppedAnnotation[]
>(
  ({ data, signService, signName }) =>
    data.length ? (
      <SignImagePagination
        croppedAnnotations={data}
        signService={signService}
        signName={signName}
      />
    ) : null,
  (props) => props.signService.getCentroidImages(props.signName),  // CHANGED: centroids only
)
```

**Key Change:** Use `getCentroidImages` instead of `getImages` for initial load. This provides just the centroid data needed to render period accordions.

### 4.2 SignImagePagination Refactor

```typescript
interface SignImagePaginationProps {
  croppedAnnotations: CroppedAnnotation[]
  signService: SignService
  signName: string
}

function SignImagePagination({ croppedAnnotations, signService, signName }: SignImagePaginationProps) {
  // Group centroids by script
  const scripts = _.groupBy(croppedAnnotations, 'script')

  // Sort by period
  const scriptsSorted = sortByPeriod(scripts)

  return (
    <Container>
      <Row className={'mt-5'}>
        <Col>
          <h3>&#8546;. Palaeography</h3>
        </Col>
      </Row>
      <Row>
        <Col className={'mb-5'}>
          {scriptsSorted.map((elem, index) => (
            <PeriodAccordion
              key={index}
              script={elem[0]}
              centroids={elem[1]}
              signService={signService}
              signName={signName}
              defaultOpen={false}  // CHANGED: All closed by default
            />
          ))}
        </Col>
      </Row>
    </Container>
  )
}
```

### 4.3 PeriodAccordion Component (NEW)

```typescript
interface PeriodAccordionProps {
  script: string
  centroids: CroppedAnnotation[]
  signService: SignService
  signName: string
  defaultOpen: boolean
}

function PeriodAccordion({ script, centroids, signService, signName, defaultOpen }: PeriodAccordionProps) {
  const [variants, setVariants] = useState<Record<string, CroppedAnnotation[]>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const handleToggle = async () => {
    if (!isLoaded && !isLoading) {
      setIsLoading(true)

      // Load variants for all centroids in this period
      const clusterIds = centroids.map(c => c.pcaClustering?.clusterId).filter(Boolean)
      const variantPromises = clusterIds.map(clusterId =>
        signService.getClusterVariants(signName, clusterId, script)
      )

      try {
        const variantResults = await Promise.all(variantPromises)

        // Group by form/variant
        const variantsByForm = {}
        variantResults.flat().forEach(annotation => {
          const form = annotation.pcaClustering?.form || 'unclassified'
          if (!variantsByForm[form]) {
            variantsByForm[form] = []
          }
          variantsByForm[form].push(annotation)
        })

        setVariants(variantsByForm)
        setIsLoaded(true)
        setIsLoading(false)
      } catch (error) {
        // Show partial data on error (graceful degradation)
        console.error('Failed to load some variants:', error)
        setIsLoaded(true)
        setIsLoading(false)
        // TODO: Show error notification to user
      }
    }
  }

  const periodName = script ? getPeriodName(script) : 'Unclassified'

  return (
    <Accordion defaultActiveKey={defaultOpen ? '0' : undefined}>
      <Accordion.Item eventKey="0">
        <Accordion.Header onClick={handleToggle}>
          {periodName}
        </Accordion.Header>
        <Accordion.Body>
          {isLoading ? (
            <Spinner />
          ) : (
            Object.entries(variants).map(([form, annotations]) => (
              <VariantGroup
                key={form}
                form={form}
                annotations={sortByDate(annotations)}
              />
            ))
          )}
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  )
}
```

**Key Features:**

- Lazy loading on accordion expansion
- Tracks loading state
- Groups variants by form
- Sorts annotations chronologically

### 4.4 VariantGroup Component (NEW) - TABLE LAYOUT

**Import:** `import { Table } from 'react-bootstrap'`

```typescript
interface VariantGroupProps {
  form: string
  annotations: CroppedAnnotation[]
}

function VariantGroup({ form, annotations }: VariantGroupProps) {
  // Separate centroid from variants
  const centroid = annotations.find(a => a.pcaClustering?.isCentroid)
  const variants = annotations.filter(a => !a.pcaClustering?.isCentroid)
  const sortedVariants = sortByDate(variants)

  return (
    <div className="variant-group mb-4">
      <h5 className="variant-group-header">
        Form: {form}
        <span className="text-muted ms-2">({annotations.length} attestations)</span>
      </h5>
      <Table striped bordered hover className="variant-table">
        <thead>
          <tr>
            <th className="centroid-column">Centroid</th>
            <th>Variants & Examples</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="centroid-cell">
              {centroid && <SignImageCell annotation={centroid} isCentroid />}
            </td>
            <td className="variants-cell">
              <div className="variants-grid">
                {sortedVariants.map((annotation, index) => (
                  <SignImageCell key={index} annotation={annotation} isCentroid={false} />
                ))}
              </div>
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
  )
}
```

### 4.5 SignImageCell Component (Refactor from SignImage) - TABLE CELL

```typescript
interface SignImageCellProps {
  annotation: CroppedAnnotation
  isCentroid: boolean
}

function SignImageCell({ annotation, isCentroid }: SignImageCellProps) {
  const label = annotation.label ? `${annotation.label} ` : ''

  return (
    <div className={`sign-image-cell ${isCentroid ? 'centroid' : 'variant'}`}>
      <Figure className="mb-2">
        <Figure.Image
          className={'sign-images__sign-image'}
          src={`data:image/png;base64, ${annotation.image}`}
          alt={`Sign ${annotation.fragmentNumber}`}
        />
        <Figure.Caption className="small">
          <Link to={`/library/${annotation.fragmentNumber}`}>
            {annotation.fragmentNumber}
          </Link>
          {label && <span className="ms-1">{label}</span>}
          {annotation.date && (
            <div className="date-display">
              <DateDisplay date={annotation.date} />
            </div>
          )}
          {annotation.provenance && (
            <div className="provenance">{annotation.provenance}</div>
          )}
        </Figure.Caption>
      </Figure>
    </div>
  )
}
```

---

## 5. Sorting and Grouping Logic

### 5.1 Date Sorting Utility

```typescript
function sortByDate(annotations: CroppedAnnotation[]): CroppedAnnotation[] {
  return _.sortBy(annotations, [
    // Dated tablets first (has date = 0 priority), undated last (no date = 1 priority)
    (a) => (a.date ? 0 : 1),
    // Among dated tablets, sort chronologically
    (a) => a.date?.toEpochDay() || Number.MAX_SAFE_INTEGER,
    // Stable sort by fragment number as tiebreaker
    (a) => a.fragmentNumber,
  ])
}
```

### 5.2 Period Sorting (Existing)

Keep existing period sorting logic from current implementation:

```typescript
function sortByPeriod(scripts: Record<string, CroppedAnnotation[]>) {
  const periodsAbbr = [...periods.map((period) => period.abbreviation), '']

  return _.sortBy(Object.entries(scripts), (elem) => {
    const index = periodsAbbr.indexOf(elem[0])
    if (index === -1) {
      throw new Error(`${elem[0]} has to be one of ${periodsAbbr}`)
    }
    return index
  })
}
```

---

## 6. CSS Updates

### 6.1 New CSS Classes - TABLE LAYOUT

**File:** `src/signs/ui/display/SignImages.css`

```css
/* Variant group container */
.variant-group {
  margin-bottom: 2rem;
}

.variant-group-header {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
  padding-bottom: 0.5rem;
}

/* Table layout */
.variant-table {
  margin-bottom: 1.5rem;
}

.centroid-column {
  width: 200px;
  background-color: #f8f9fa;
  font-weight: 600;
  vertical-align: top;
}

.centroid-cell {
  background-color: #f8f9fa;
  padding: 1rem;
  vertical-align: top;
}

.variants-cell {
  padding: 1rem;
  vertical-align: top;
}

/* Grid for variants in right column */
.variants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

/* Individual sign cell */
.sign-image-cell {
  display: inline-block;
}

.sign-image-cell.centroid {
  border: 2px solid #0d6efd;
  padding: 0.5rem;
  border-radius: 4px;
  background-color: #e7f1ff;
}

.sign-image-cell.variant {
  border: 1px solid #dee2e6;
  padding: 0.5rem;
  border-radius: 4px;
}

/* Sign image */
.sign-images__sign-image {
  max-width: 100%;
  height: auto;
  display: block;
  margin-bottom: 0.5rem;
}

/* Metadata */
.date-display {
  font-size: 0.875rem;
  color: #495057;
  margin-top: 0.25rem;
}

.provenance {
  font-size: 0.875rem;
  font-style: italic;
  color: #6c757d;
  margin-top: 0.25rem;
}

/* Responsive design for mobile */
@media (max-width: 768px) {
  .variant-table {
    display: block;
  }

  .variant-table thead,
  .variant-table tbody,
  .variant-table tr,
  .variant-table td {
    display: block;
    width: 100%;
  }

  .variant-table thead {
    display: none; /* Hide table headers on mobile */
  }

  .centroid-cell {
    border-bottom: 2px solid #0d6efd;
    margin-bottom: 1rem;
  }

  .variants-cell {
    padding-top: 0;
  }

  .variants-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
```

---

## 7. Backend Coordination

### 7.1 Required Backend API Endpoints ✅ CONFIRMED

Backend team confirmed they will provide filtered endpoints:

**Endpoint 1: Get Centroids Only**

```
GET /signs/{signName}/images?centroids_only=true
```

- Returns only annotations where `pcaClustering.isCentroid === true`
- Used for initial page load
- Minimal payload for fast loading

**Endpoint 2: Get Cluster Variants**

```
GET /signs/{signName}/images/cluster/{clusterId}?script={script}
```

- Returns all annotations for a specific cluster in a period
- Includes both centroid and all variants/examples
- Used when accordion is expanded for a period
- Alternative design: Could return variants only (excluding centroid) if centroid already loaded

**Endpoint 3: Get All Images (Existing - Deprecated for this view)**

```
GET /signs/{signName}/images
```

- Keep for backward compatibility
- Returns all annotations (centroids + variants)
- Not used in new PCA clustering view

### 7.2 Backend API Response Format

Backend response should match the schema from `annotations_schema.py`:

```json
{
  "fragmentNumber": "K.1234",
  "image": "base64string...",
  "script": "NA",
  "label": "obv. i 1",
  "provenance": "Nineveh",
  "date": {...},
  "annotationId": "fe424867cb374697be3110157f17f39c",
  "pcaClustering": {
    "clusterId": "af26e35a-1df7-56af-9b6c-30d12be2c863",
    "clusterRank": 0,
    "form": "canonical1",
    "isCentroid": false,
    "clusterSize": 26,
    "isMain": true
  }
}
```

**Note:** Ensure camelCase conversion happens in frontend (backend uses snake_case).

---

## 8. Testing Strategy

### 8.1 Unit Tests

#### Update `SignImages.test.tsx`

- Test centroid-only loading
- Mock `getCentroidImages` instead of `getImages`
- Test empty state when no centroids exist

#### Create `PeriodAccordion.test.tsx`

- Test lazy loading on accordion expansion
- Test loading state display
- Test variant grouping
- Mock `getClusterVariants` API call
- Test error handling

#### Create `VariantGroup.test.tsx`

- Test rendering of form/variant name
- Test table structure (centroid column vs variants column)
- Test centroid in left cell
- Test multiple variants in right cell grid
- Test empty state (no centroid, no variants)

#### Create `SignImageCell.test.tsx`

- Rename from `SignImage` tests
- Test image display in table cell context
- Test centroid visual distinction (border/background)
- Test date/provenance/label display
- Test fragment number link

### 8.2 Integration Tests

Test full flow:

1. Initial load shows only centroids
2. Click accordion to expand period
3. Verify variants are loaded
4. Verify signs are grouped by form
5. Verify chronological sorting (dated first)

### 8.3 Test Data

Create mock data with PCA clustering:

```typescript
const mockCentroid: CroppedAnnotation = {
  fragmentNumber: 'K.6400',
  image: 'base64string',
  script: 'NA',
  label: 'obv. 1',
  annotationId: 'abc123',
  pcaClustering: {
    clusterId: 'cluster-1',
    clusterRank: 0,
    form: 'canonical1',
    isCentroid: true,
    clusterSize: 10,
    isMain: true
  }
}

const mockVariant: CroppedAnnotation = {
  fragmentNumber: 'K.6401',
  image: 'base64string',
  script: 'NA',
  label: 'obv. 2',
  date: MesopotamianDate.fromJson({...}),
  annotationId: 'def456',
  pcaClustering: {
    clusterId: 'cluster-1',
    clusterRank: 5,
    form: 'canonical1',
    isCentroid: false,
    clusterSize: 10,
    isMain: false
  }
}
```

---

## 9. Performance Considerations

### 9.1 Lazy Loading Benefits

- Initial page load only fetches ~10-20 centroids instead of 100-200 total signs
- Reduces initial payload by ~80-90%
- Accordion expansion triggers on-demand loading

### 9.2 Caching Strategy

Add caching to prevent re-fetching:

```typescript
const [variantCache, setVariantCache] = useState<
  Record<string, CroppedAnnotation[]>
>({})

const loadVariants = async (clusterId: string) => {
  if (variantCache[clusterId]) {
    return variantCache[clusterId]
  }

  const variants = await signService.getClusterVariants(
    signName,
    clusterId,
    script,
  )
  setVariantCache((prev) => ({ ...prev, [clusterId]: variants }))
  return variants
}
```

### 9.3 Loading States

Provide feedback during async operations:

- Show spinner inside accordion body while loading
- Disable accordion header during load
- Show error message if load fails

---

## 10. Migration Path

### Phase 1: Update Domain Models ✓

- Add `PcaClustering` interface
- Update `CroppedAnnotation` interface
- No breaking changes (all fields optional)

### Phase 2: Update API Layer ✓

- Add new service methods
- Add new repository methods
- Keep existing methods for backward compatibility

### Phase 3: Refactor Components

- Create new components (`PeriodAccordion`, `VariantGroup`, `SignImageCard`)
- Update `SignImagePagination`
- Update `SignImages` to use centroid loading

### Phase 4: Update Tests

- Update existing tests
- Add new component tests
- Add integration tests

### Phase 5: CSS Updates

- Add new styling for variant groups
- Ensure responsive design

### Phase 6: Backend Verification

- Confirm API endpoints match expectations
- Test with real data
- Performance benchmarking

---

## 11. Decisions & Answers from Requirements Review

### 11.1 Backend API Design ✅

- [x] Can backend support `centroids_only` query parameter? → **YES**
- [x] Can backend support cluster-specific filtering? → **YES**
- [x] Client-side filtering needed? → **NO** - Backend will handle all filtering

**Decision:** Backend will provide filtered endpoints. Frontend will use API-level filtering for optimal performance.

### 11.2 UI/UX Details ✅

- [x] Should first accordion be open by default? → **NO** - All accordions closed on initial load
- [x] What shows by default? → **Only centroid forms** displayed initially (before any accordion expansion)
- [x] Show centroid count in period headers? → **NO**
- [x] How to indicate which sign is the centroid within a variant group? → **Show in left column of table** (as per PDF design)
- [x] Should clicking a centroid sign expand its variants? → **NO** - Only clicking the accordion header opens all centroids, variants, and examples for that period

**Decision:** Use table-based layout (not card grid). Centroids appear in leftmost column. All accordions closed by default.

### 11.3 Error Handling ✅

- [x] What happens if variant loading fails? → **Show partial data** (display what was successfully loaded)
- [x] Show error message? → **YES** - Display error message but retain partial data
- [x] Retry mechanism? → **Later consideration** - Not required for MVP

**Decision:** Graceful degradation - show what loaded successfully, notify user of failures.

### 11.4 Design Specifications (From PDF)

- **Layout:** Table-based structure (not grid of cards)
- **Centroid indication:** Leftmost column dedicated to centroid signs
- **Variant organization:** Rows grouped by variant/form
- **Initial state:** Closed accordions showing only top-level centroids
- **Expanded state:** Table reveals all variants and examples organized by form

---

## 12. Implementation Estimate

**Total Effort:** ~3-5 days

### Breakdown:

- Domain model updates: 0.5 days
- API layer updates: 0.5 days
- Component refactoring: 2 days
- Testing: 1-1.5 days
- CSS/styling: 0.5 days

**Dependencies:**

- Backend API changes (if needed): +1-2 days
- Design review/clarifications: 0.5 days

---

## 13. Success Criteria

- [ ] Initial page load is 80-90% faster (measured via Network tab)
- [ ] Only centroids are loaded initially
- [ ] Accordion expansion loads variants without page refresh
- [ ] Signs are grouped by variant (form)
- [ ] Signs within variant sorted chronologically (dated first)
- [ ] All existing tests pass
- [ ] New tests achieve 100% coverage
- [ ] No TypeScript errors
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Accessibility: keyboard navigation works
- [ ] Loading states are clear to users

---

## 14. Files to Create/Modify

### Create:

- `src/signs/ui/display/PeriodAccordion.tsx`
- `src/signs/ui/display/PeriodAccordion.test.tsx`
- `src/signs/ui/display/VariantGroup.tsx`
- `src/signs/ui/display/VariantGroup.test.tsx`
- `src/signs/ui/display/SignImageCell.tsx` (renamed from SignImageCard for table layout)
- `src/signs/ui/display/SignImageCell.test.tsx`

### Modify:

- `src/signs/domain/CroppedAnnotation.ts` - Add PcaClustering interface
- `src/signs/application/SignService.ts` - Add centroid/variant methods
- `src/signs/infrastructure/SignRepository.ts` - Add API calls
- `src/signs/ui/display/SignImages.tsx` - Update to use centroid loading
- `src/signs/ui/display/SignImages.test.tsx` - Update mocks and assertions
- `src/signs/ui/display/SignImages.css` - Add variant group styling

---

## 16. Design Analysis & Implementation Notes

### 16.1 Layout Structure (From PDF Review)

The PDF design shows a **table-based layout** with the following key characteristics:

1. **Two-column table structure:**
   - Left column: Dedicated to centroid sign (single image)
   - Right column: Grid of variant/example signs (multiple images)

2. **Visual hierarchy:**
   - Form/variant name as section header
   - Clear visual separation between centroid and variants
   - Centroid highlighted with distinct background/border

3. **Accordion behavior:**
   - All periods collapsed by default
   - Clicking accordion header loads and displays full table for that period
   - Each period shows multiple forms/variants organized in separate tables

4. **Information density:**
   - Compact display with multiple signs visible simultaneously
   - Fragment numbers, dates, and provenance shown beneath each image
   - Chronological ordering within variant groups

### 16.2 Key Implementation Decisions

- **Use `<Table>` from react-bootstrap** for structured layout
- **Centroid cell**: Fixed-width left column with special styling
- **Variants cell**: Flexible-width right column with CSS Grid for responsive layout
- **No default open accordion**: Reduces initial cognitive load
- **Lazy loading**: Only fetch data for periods when user expands accordion
- **Error handling**: Graceful degradation showing partial data

### 16.3 Responsive Considerations

- **Desktop**: Full two-column table layout
- **Tablet**: May need to adjust grid columns in variants cell (e.g., 2-3 columns)
- **Mobile**: Consider stacking centroid above variants instead of side-by-side
  - Use media queries to switch from table to stacked layout on small screens

---

## 17. Next Steps

1. ✅ **Backend API capabilities confirmed** - Filtered endpoints will be provided
2. ✅ **UI/UX decisions confirmed** - Table layout, all accordions closed by default
3. ✅ **Error handling strategy confirmed** - Show partial data on failures
4. **Get approval to proceed** with implementation
5. **Create task breakdown** in project management tool (if needed)
6. **Begin Phase 1** (domain model updates)
7. **Coordinate with backend team** on API endpoint specifications

---

## 18. References

- Current implementation: `src/signs/ui/display/SignImages.tsx`
- Backend schema: `annotation.py`, `annotations_schema.py`
- Mock design: `Design_signs (2).pdf`
- Testing patterns: `src/signs/ui/display/SignImages.test.tsx`
