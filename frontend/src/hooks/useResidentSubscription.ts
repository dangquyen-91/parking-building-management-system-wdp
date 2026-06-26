import { useEffect, useMemo, useState } from 'react'
import {
  userSubscriptionApi,
  type AvailableCarSubscriptions,
  type AvailableMotorcycleSubscriptions,
  type Plan,
  type Subscription,
  type SubscriptionPayment,
  type VehicleType,
} from '../services/userSubscriptionApi'
import { normalizePlate } from '../utils/subscriptionUi'

type UseResidentSubscriptionOptions = {
  initialVehicleType?: VehicleType
  initialPlanId?: string
}

export function useResidentSubscription(options: UseResidentSubscriptionOptions = {}) {
  const [vehicleType, setVehicleType] = useState<VehicleType>(options.initialVehicleType ?? 'motorcycle')
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState(options.initialPlanId ?? '')
  const [licensePlate, setLicensePlate] = useState('')
  const [selectedSlotId, setSelectedSlotId] = useState('')
  const [availableData, setAvailableData] = useState<AvailableCarSubscriptions | AvailableMotorcycleSubscriptions | null>(null)
  const [createdSubscription, setCreatedSubscription] = useState<Subscription | null>(null)
  const [payment, setPayment] = useState<SubscriptionPayment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      setIsLoading(true)
      setError(null)

      try {
        const [plansResponse, availableResponse] = await Promise.all([
          userSubscriptionApi.getPlans({ vehicleType, isActive: true }),
          userSubscriptionApi.getAvailableForSubscription(vehicleType),
        ])

        if (!isMounted) return

        const activePlans = plansResponse.plans.filter((plan) => plan.isActive)
        setPlans(activePlans)
        setSelectedPlanId((current) => {
          if (current && activePlans.some((plan) => plan._id === current)) return current
          return ''
        })
        setAvailableData(availableResponse)
        setSelectedSlotId('')
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu gói cư dân.')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void loadData()

    return () => {
      isMounted = false
    }
  }, [vehicleType])

  const selectedPlan = plans.find((plan) => plan._id === selectedPlanId)

  const carFloors = useMemo(() => {
    if (!availableData || availableData.vehicleType !== 'car') return []
    return availableData.floors
  }, [availableData])

  const motorcycleAvailability = availableData?.vehicleType === 'motorcycle' ? availableData : null
  const canSubmit =
    Boolean(selectedPlanId) &&
    normalizePlate(licensePlate).length >= 4 &&
    (vehicleType === 'motorcycle' || Boolean(selectedSlotId))

  function handleVehicleTypeChange(value: VehicleType) {
    setVehicleType(value)
    setCreatedSubscription(null)
    setPayment(null)
    setMessage(null)
    setSelectedSlotId('')
  }

  async function handlePurchase() {
    if (!canSubmit) return

    setIsSubmitting(true)
    setError(null)
    setMessage(null)
    setCreatedSubscription(null)
    setPayment(null)

    try {
      const result = await userSubscriptionApi.purchaseSubscription({
        planId: selectedPlanId,
        licensePlate: normalizePlate(licensePlate),
        slotId: vehicleType === 'car' ? selectedSlotId : undefined,
      })
      setCreatedSubscription(result.subscription)
      setPayment(result.payment)
      setMessage('Đã tạo đơn mua gói. Vui lòng thanh toán để kích hoạt quyền cư dân cho biển số này.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo đơn mua gói.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    vehicleType,
    plans,
    selectedPlanId,
    setSelectedPlanId,
    licensePlate,
    setLicensePlate,
    selectedSlotId,
    setSelectedSlotId,
    createdSubscription,
    payment,
    isLoading,
    isSubmitting,
    error,
    message,
    selectedPlan,
    carFloors,
    motorcycleAvailability,
    canSubmit,
    handleVehicleTypeChange,
    handlePurchase,
  }
}
