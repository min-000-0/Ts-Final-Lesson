export type CouponData = {
   id: string
   title: string
   is_enabled: number
   percent: number
   code: string
   due_date: number
}

export type CreateCouponParams = Omit<CouponData, 'id'>

export type EditCouponParams = {
   id: string
   data: CreateCouponParams
}

export type Pagination = {
  total_pages: number
  current_page: number
  has_pre: boolean
  has_next: boolean
  category: string
}

export type GetCouponsResponse = {
   success: boolean
   coupons: Array<CouponData>
   pagination: Pagination
   messages: Array<unknown>
}

export type MessageResponse = {
  success: boolean
  message: string
}

export type CreateCouponResponse = MessageResponse
export type EditCouponResponse = MessageResponse
export type DeleteCouponResponse = MessageResponse
