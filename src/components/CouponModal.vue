<script setup lang="ts">
import { apiCreateCoupon, apiEditCoupon } from '@/api/coupons'
import type { CouponData } from '@/types/coupon'
import { Modal } from 'bootstrap'
import { computed, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'

interface CouponModalProps {
  coupon: CouponData
}

const props = defineProps<CouponModalProps>()

const emit = defineEmits(['get-coupons'])

const modalRef = useTemplateRef<HTMLElement>('modalRef')
let modal: Modal | null = null

onMounted(() => {
  if (modalRef.value) {
    modal = new Modal(modalRef.value)
  }
})

onUnmounted(() => {
  if (modal) {
    modal.dispose()
  }
})

const openModal = () => {
  if (modal) {
    modal.show()
  }
}

const closeModal = () => {
  if (modal) {
    modal.hide()
  }
}

const form = ref<Omit<CouponData, 'due_date'> & { due_date: string }>({
  id: '',
  title: '',
  is_enabled: 0,
  percent: 0,
  code: '',
  due_date: '',
})

watch(
  () => props.coupon,
  (newCoupon) => {
    if (newCoupon.id) {
      const date = new Date(newCoupon.due_date * 1000)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')

      form.value = {
        ...newCoupon,
        due_date: `${year}-${month}-${day}`,
      }
    } else {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')

      form.value = {
        id: '',
        title: '',
        is_enabled: 0,
        percent: 0,
        code: '',
        due_date: `${year}-${month}-${day}`,
      }
    }
  },
  { immediate: true, deep: true },
)

const isEditMode = computed(() => Boolean(props.coupon.id))
const isLoading = ref(false)
const modalTitle = computed(() => (isEditMode.value ? '編輯優惠券' : '新增優惠券'))

const saveCoupon = async () => {
  isLoading.value = true

  const dateObj = new Date(form.value.due_date)
  const timestamp = Math.floor(dateObj.getTime() / 1000)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, due_date, ...couponData } = form.value
  const data = {
    ...couponData,
    due_date: timestamp,
  }

  try {
    if (isEditMode.value && id) {
      await apiEditCoupon({ id, data })
    } else {
      await apiCreateCoupon(data)
    }
    closeModal()
    emit('get-coupons')
  } catch (error) {
    console.error('error', error)
    alert('新增/編輯優惠券失敗')
  } finally {
    isLoading.value = false
  }
}

defineExpose({
  openModal,
  closeModal,
})
</script>

<template>
  <div
    ref="modalRef"
    class="modal fade"
    id="couponModal"
    tabindex="-1"
    aria-labelledby="couponModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-lg">
        <div class="modal-header">
          <h5 class="modal-title" id="couponModalLabel">{{ modalTitle }}</h5>
          <button
            @click="closeModal"
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <form>
            <div class="mb-3">
              <label for="couponTitle" class="form-label">名稱</label>
              <input
                v-model="form.title"
                type="text"
                class="form-control rounded-lg"
                id="couponTitle"
                placeholder="請輸入名稱"
              />
            </div>
            <div class="mb-3">
              <label for="couponCode" class="form-label">折扣碼</label>
              <input
                v-model="form.code"
                type="text"
                class="form-control rounded-lg"
                id="couponCode"
                placeholder="請輸入折扣碼"
              />
            </div>
            <div class="mb-3">
              <label for="couponDate" class="form-label">截止日</label>
              <input
                v-model="form.due_date"
                type="date"
                class="form-control rounded-lg"
                id="couponDate"
              />
            </div>
            <div class="mb-3">
              <label for="couponPercent" class="form-label">折扣百分比</label>
              <input
                v-model.number="form.percent"
                type="number"
                class="form-control rounded-lg"
                id="couponPercent"
                placeholder="請輸入折扣百分比"
              />
            </div>
            <div class="mb-3 d-flex align-items-center">
              <label class="form-label me-3 mb-0">是否啟用</label>
              <div class="form-check form-switch">
                <input
                  v-model="form.is_enabled"
                  class="form-check-input"
                  type="checkbox"
                  id="couponEnabled"
                  :true-value="1"
                  :false-value="0"
                />
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" type="button" class="btn btn-outline-secondary rounded-lg">
            取消
          </button>
          <button
            @click="saveCoupon"
            :disabled="isLoading"
            type="button"
            class="btn btn-dark rounded-lg"
          >
            <span
              v-if="isLoading"
              class="spinner-border spinner-border-sm me-1"
              role="status"
              aria-hidden="true"
            ></span>
            儲存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
