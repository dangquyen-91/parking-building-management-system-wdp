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
import type { UserVehicle } from '../services/authApi'
import { userApi } from '../services/userApi'
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
  const [registeredVehicles, setRegisteredVehicles] = useState<UserVehicle[]>([])
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
        const [plansResponse, availableResponse, profileResponse] = await Promise.all([
          userSubscriptionApi.getPlans({ vehicleType, isActive: true }),
          userSubscriptionApi.getAvailableForSubscription(vehicleType),
          userApi.getMe(),
        ])

        if (!isMounted) return

        const activePlans = plansResponse.plans.filter((plan) => plan.isActive)
        setPlans(activePlans)
        setSelectedPlanId((current) => {
          if (current && activePlans.some((plan) => plan._id === current)) return current
          return ''
        })
        setAvailableData(availableResponse)
        const vehicles = profileResponse.user.vehicles ?? []
        setRegisteredVehicles(vehicles)
        setLicensePlate((current) => {
          const belongsToVehicleType = vehicles.some(
            (vehicle) => vehicle.vehicleType === vehicleType && normalizePlate(vehicle.licensePlate) === normalizePlate(current),
          )
          return belongsToVehicleType ? current : ''
        })
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
  const eligibleVehicles = useMemo(
    () => registeredVehicles.filter((vehicle) => vehicle.vehicleType === vehicleType),
    [registeredVehicles, vehicleType],
  )
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
    setLicensePlate('')
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
    eligibleVehicles,
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
