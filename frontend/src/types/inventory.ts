export interface Instance {
  id: string
  title: string
  subtitle?: string
  index_title?: string
  series?: string
  edition?: string
  publication?: string[]
  publication_period?: {
    start?: number
    end?: number
  }
  identifiers?: Array<{
    value: string
    identifier_type_id: string
  }>
  contributors?: Array<{
    name: string
    contributor_type_id: string
    contributor_name_type_id?: string
    primary?: boolean
  }>
  subjects?: string[]
  classifications?: Array<{
    classification_number: string
    classification_type_id: string
  }>
  languages?: string[]
  notes?: Array<{
    note: string
    note_type?: string
    staff_only?: boolean
  }>
  electronic_access?: Array<{
    uri: string
    link_text?: string
    materials_specification?: string
    public_note?: string
    relationship_id?: string
  }>
  instance_type_id: string
  instance_format_ids?: string[]
  cataloged_date?: string
  previously_held?: boolean
  staff_suppress?: boolean
  discovery_suppress?: boolean
  source?: string
  metadata?: {
    created_date?: string
    created_by_user_id?: string
    updated_date?: string
    updated_by_user_id?: string
  }
  tags?: string[]
  tenant_id?: string
}

export interface InstanceCreate {
  title: string
  subtitle?: string
  index_title?: string
  series?: string
  edition?: string
  publication?: string[]
  publication_period?: {
    start?: number
    end?: number
  }
  identifiers?: Array<{
    value: string
    identifier_type_id: string
  }>
  contributors?: Array<{
    name: string
    contributor_type_id: string
    contributor_name_type_id?: string
    primary?: boolean
  }>
  subjects?: string[]
  classifications?: Array<{
    classification_number: string
    classification_type_id: string
  }>
  languages?: string[]
  notes?: Array<{
    note: string
    note_type?: string
    staff_only?: boolean
  }>
  electronic_access?: Array<{
    uri: string
    link_text?: string
    materials_specification?: string
    public_note?: string
    relationship_id?: string
  }>
  instance_type_id: string
  instance_format_ids?: string[]
  cataloged_date?: string
  previously_held?: boolean
  staff_suppress?: boolean
  discovery_suppress?: boolean
  source?: string
  tags?: string[]
}

export interface InstanceUpdate {
  title?: string
  subtitle?: string
  index_title?: string
  series?: string
  edition?: string
  publication?: string[]
  publication_period?: {
    start?: number
    end?: number
  }
  identifiers?: Array<{
    value: string
    identifier_type_id: string
  }>
  contributors?: Array<{
    name: string
    contributor_type_id: string
    contributor_name_type_id?: string
    primary?: boolean
  }>
  subjects?: string[]
  classifications?: Array<{
    classification_number: string
    classification_type_id: string
  }>
  languages?: string[]
  notes?: Array<{
    note: string
    note_type?: string
    staff_only?: boolean
  }>
  electronic_access?: Array<{
    uri: string
    link_text?: string
    materials_specification?: string
    public_note?: string
    relationship_id?: string
  }>
  instance_type_id?: string
  instance_format_ids?: string[]
  cataloged_date?: string
  previously_held?: boolean
  staff_suppress?: boolean
  discovery_suppress?: boolean
  source?: string
  tags?: string[]
}

export interface InstanceFilters {
  page?: number
  page_size?: number
  q?: string
}

export interface PaginationMeta {
  page: number
  page_size: number
  total_items: number
  total_pages: number
}
