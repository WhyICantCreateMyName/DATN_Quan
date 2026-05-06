export interface PaginationResponse<T> {
  data: T[];
  page: number;
  total: number;
  limit: number;
}

export * as MembershipType from './membership';
export * as ClassType from './class';
export * as ProductType from './product';
export * as UserType from './user';
export * as StatsType from './stats';
export * as HRMType from './hrm';
