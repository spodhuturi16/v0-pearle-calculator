"use client"

import { useState, useMemo, useEffect } from "react"
import { Calculator, ShoppingCart, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Navigation } from "@/components/navigation"

const examOptions = [
  { id: "eye-exam", name: "Comprehensive Eye Exam", price: 89 },
  { id: "contact-exam", name: "Contact Lens Exam", price: 45 },
  { id: "refraction", name: "Refraction Test", price: 25 },
  { id: "retinal-photos", name: "Retinal Fundus Photos", price: 35 },
]

const lensCategories = [
  {
    id: "lens-type",
    name: "Lens Type",
    options: ["None", "Single Vision", "Bifocal", "Progressive"],
    prices: { "Single Vision": 120, Bifocal: 180, Progressive: 250 },
  },
  {
    id: "lens-design",
    name: "Lens Design",
    options: ["None", "Standard", "Aspheric", "Free-form", "Digital Progressive"],
    prices: { Standard: 0, Aspheric: 40, "Free-form": 80, "Digital Progressive": 120 },
  },
  {
    id: "material",
    name: "Material",
    options: ["None", "Standard Plastic", "Polycarbonate", "High Index"],
    prices: { "Standard Plastic": 0, Polycarbonate: 40, "High Index": 80 },
  },
  {
    id: "coatings",
    name: "Coatings",
    options: ["None", "Anti-Reflective", "Scratch Resistant", "UV Protection"],
    prices: { "Anti-Reflective": 75, "Scratch Resistant": 25, "UV Protection": 35 },
  },
  { id: "backside-uv", name: "Backside UV", type: "checkbox", price: 15 },
  { id: "edge-polish", name: "Edge Polish", type: "checkbox", price: 20 },
  {
    id: "color",
    name: "Color",
    options: ["None", "Clear", "Light Tint", "Medium Tint", "Dark Tint", "Gradient"],
    prices: { Clear: 0, "Light Tint": 25, "Medium Tint": 35, "Dark Tint": 45, Gradient: 55 },
  },
  {
    id: "custom-measurements",
    name: "Custom Measurements",
    options: ["None", "Standard Fit", "Custom PD", "Custom Seg Height", "Full Custom"],
    prices: { "Standard Fit": 0, "Custom PD": 15, "Custom Seg Height": 25, "Full Custom": 50 },
  },
  { id: "blue-light-filter", name: "Blue Light Filter", type: "checkbox", price: 65 },
  { id: "protection", name: "1-Year Protection", type: "checkbox", price: 50 },
]

const addOnOptions = [
  { id: 1, name: "None", price: 0 },
  { id: 2, name: "Custom Tint", price: 40 },
  { id: 3, name: "Premium Case", price: 25 },
  { id: 4, name: "Blue Light Filter", price: 60 },
  { id: 5, name: "Photochromic Lenses", price: 120 },
]

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)

const handleCurrencyInput = (value: string) => {
  // Allow only numbers and one decimal point
  const cleaned = value.replace(/[^0-9.]/g, "")

  // Prevent multiple decimal points
  const parts = cleaned.split(".")
  if (parts.length > 2) {
    return parts[0] + "." + parts.slice(1).join("")
  }

  // Limit decimal places to 2 during input
  if (parts[1] && parts[1].length > 2) {
    return parts[0] + "." + parts[1].substring(0, 2)
  }

  return cleaned
}

const formatCurrencyOnBlur = (value: string) => {
  if (value === "") return ""
  // Remove any existing formatting
  const numericValue = value.replace(/[^0-9.]/g, "")
  if (numericValue === "") return ""

  const number = Number.parseFloat(numericValue)
  if (isNaN(number)) return ""

  // Format to 2 decimal places
  return number.toFixed(2)
}

const formatPercentageInput = (value: string) => {
  const numericValue = value.replace(/[^0-9.]/g, "")
  if (numericValue === "") return ""
  const number = Number.parseFloat(numericValue)
  if (isNaN(number)) return ""
  return number.toString()
}

interface FinancialDetails {
  allowance: string
  discount: string
  copay: string
}

interface AddOnWithFinancials {
  id: number
  optionId: number
  financials: FinancialDetails
  expanded: boolean
}

export default function CalculatorPage() {
  const [customerName, setCustomerName] = useState("")
  const [insuranceType, setInsuranceType] = useState("other")
  const [selectedExams, setSelectedExams] = useState<Record<string, boolean>>({})
  const [examFinancials, setExamFinancials] = useState<Record<string, FinancialDetails>>({})
  const [expandedExams, setExpandedExams] = useState<Record<string, boolean>>({})

  const [framePrice, setFramePrice] = useState("")
  const [frameAllowance, setFrameAllowance] = useState("")
  const [frameDiscount, setFrameDiscount] = useState("")
  const [frameCopay, setFrameCopay] = useState("")

  const [selectedLenses, setSelectedLenses] = useState<Record<string, string | boolean>>({ "edge-polish": true })
  const [lensFinancials, setLensFinancials] = useState<Record<string, FinancialDetails>>({})
  const [expandedLenses, setExpandedLenses] = useState<Record<string, boolean>>({})

  const [addOns, setAddOns] = useState<AddOnWithFinancials[]>([])
  const [userName] = useState("John Smith")
  const [storeName] = useState("Downtown Vision Center")

  // Auto-expand sections when items are selected (only if not already manually set)
  useEffect(() => {
    Object.keys(selectedExams).forEach((examId) => {
      if (selectedExams[examId] && expandedExams[examId] === undefined) {
        setExpandedExams((prev) => ({ ...prev, [examId]: true }))
      }
    })
  }, [selectedExams, expandedExams])

  useEffect(() => {
    Object.keys(selectedLenses).forEach((lensId) => {
      const selection = selectedLenses[lensId]
      if ((selection === true || (selection !== "None" && selection)) && expandedLenses[lensId] === undefined) {
        setExpandedLenses((prev) => ({ ...prev, [lensId]: true }))
      }
    })
  }, [selectedLenses, expandedLenses])

  const summary = useMemo(() => {
    let retailTotal = 0
    let finalCost = 0
    const items: Array<{ name: string; price: string; details?: string }> = []

    // Exams
    examOptions.forEach((exam) => {
      if (selectedExams[exam.id]) {
        const financials = examFinancials[exam.id] || { allowance: "", discount: "", copay: "" }
        const allowance = Number.parseFloat(financials.allowance || "0")
        const discount = Number.parseFloat(financials.discount || "0")
        const copay = Number.parseFloat(financials.copay || "0")

        const discountedPrice = exam.price * (1 - discount / 100)
        const afterAllowance = Math.max(0, discountedPrice - allowance)
        const finalPrice = afterAllowance + copay

        retailTotal += exam.price
        finalCost += finalPrice

        let details = ""
        if (allowance > 0 || discount > 0 || copay > 0) {
          const parts = []
          if (discount > 0) parts.push(`${discount}% discount`)
          if (allowance > 0) parts.push(`${formatCurrency(allowance)} allowance`)
          if (copay > 0) parts.push(`${formatCurrency(copay)} copay`)
          details = parts.join(", ")
        }

        items.push({
          name: exam.name,
          price: formatCurrency(finalPrice),
          details,
        })
      }
    })

    // Frame
    const frameRetail = Number.parseFloat(framePrice) || 0
    if (frameRetail > 0) {
      const allowance = Number.parseFloat(frameAllowance) || 0
      const discount = Number.parseFloat(frameDiscount) || 0
      const copay = Number.parseFloat(frameCopay) || 0

      const discountedPrice = frameRetail * (1 - discount / 100)
      const afterAllowance = Math.max(0, discountedPrice - allowance)
      const frameCost = afterAllowance + copay

      retailTotal += frameRetail
      finalCost += frameCost

      let details = ""
      if (allowance > 0 || discount > 0 || copay > 0) {
        const parts = []
        if (discount > 0) parts.push(`${discount}% discount`)
        if (allowance > 0) parts.push(`${formatCurrency(allowance)} allowance`)
        if (copay > 0) parts.push(`${formatCurrency(copay)} copay`)
        details = parts.join(", ")
      }

      items.push({
        name: "Frame",
        price: formatCurrency(frameCost),
        details,
      })
    }

    // Lenses
    lensCategories.forEach((category) => {
      const selection = selectedLenses[category.id]
      if (category.type === "checkbox" && selection) {
        const financials = lensFinancials[category.id] || { allowance: "", discount: "", copay: "" }
        const allowance = Number.parseFloat(financials.allowance || "0")
        const discount = Number.parseFloat(financials.discount || "0")
        const copay = Number.parseFloat(financials.copay || "0")

        const basePrice = category.price || 0
        const discountedPrice = basePrice * (1 - discount / 100)
        const afterAllowance = Math.max(0, discountedPrice - allowance)
        const finalPrice = afterAllowance + copay

        retailTotal += basePrice
        finalCost += finalPrice

        let details = ""
        if (allowance > 0 || discount > 0 || copay > 0) {
          const parts = []
          if (discount > 0) parts.push(`${discount}% discount`)
          if (allowance > 0) parts.push(`${formatCurrency(allowance)} allowance`)
          if (copay > 0) parts.push(`${formatCurrency(copay)} copay`)
          details = parts.join(", ")
        }

        items.push({
          name: category.name,
          price: formatCurrency(finalPrice),
          details,
        })
      } else if (category.type !== "checkbox" && selection && selection !== "None") {
        const financials = lensFinancials[category.id] || { allowance: "", discount: "", copay: "" }
        const allowance = Number.parseFloat(financials.allowance || "0")
        const discount = Number.parseFloat(financials.discount || "0")
        const copay = Number.parseFloat(financials.copay || "0")

        const basePrice = category.prices?.[selection as string] || 0
        const discountedPrice = basePrice * (1 - discount / 100)
        const afterAllowance = Math.max(0, discountedPrice - allowance)
        const finalPrice = afterAllowance + copay

        retailTotal += basePrice
        finalCost += finalPrice

        let details = ""
        if (allowance > 0 || discount > 0 || copay > 0) {
          const parts = []
          if (discount > 0) parts.push(`${discount}% discount`)
          if (allowance > 0) parts.push(`${formatCurrency(allowance)} allowance`)
          if (copay > 0) parts.push(`${formatCurrency(copay)} copay`)
          details = parts.join(", ")
        }

        items.push({
          name: `${category.name}: ${selection}`,
          price: formatCurrency(finalPrice),
          details,
        })
      }
    })

    // Add-Ons
    addOns.forEach((addOn) => {
      const option = addOnOptions.find((opt) => opt.id === addOn.optionId)
      if (option && option.price > 0) {
        const allowance = Number.parseFloat(addOn.financials.allowance || "0")
        const discount = Number.parseFloat(addOn.financials.discount || "0")
        const copay = Number.parseFloat(addOn.financials.copay || "0")

        const discountedPrice = option.price * (1 - discount / 100)
        const afterAllowance = Math.max(0, discountedPrice - allowance)
        const finalPrice = afterAllowance + copay

        retailTotal += option.price
        finalCost += finalPrice

        let details = ""
        if (allowance > 0 || discount > 0 || copay > 0) {
          const parts = []
          if (discount > 0) parts.push(`${discount}% discount`)
          if (allowance > 0) parts.push(`${formatCurrency(allowance)} allowance`)
          if (copay > 0) parts.push(`${formatCurrency(copay)} copay`)
          details = parts.join(", ")
        }

        items.push({
          name: option.name,
          price: formatCurrency(finalPrice),
          details,
        })
      }
    })

    const insuranceSavings = retailTotal - finalCost

    return { retailTotal, finalCost, insuranceSavings, items }
  }, [
    selectedExams,
    examFinancials,
    framePrice,
    frameAllowance,
    frameDiscount,
    frameCopay,
    selectedLenses,
    lensFinancials,
    addOns,
  ])

  const handleExamToggle = (examId: string, checked: boolean) => {
    setSelectedExams((prev) => ({ ...prev, [examId]: checked }))
    if (checked && !examFinancials[examId]) {
      setExamFinancials((prev) => ({
        ...prev,
        [examId]: { allowance: "", discount: "", copay: "" },
      }))
    }
  }

  const handleExamFinancialChange = (examId: string, field: keyof FinancialDetails, value: string) => {
    let formattedValue = value
    if (field === "allowance" || field === "copay") {
      formattedValue = handleCurrencyInput(value)
    } else if (field === "discount") {
      formattedValue = formatPercentageInput(value)
    }

    setExamFinancials((prev) => ({
      ...prev,
      [examId]: { ...prev[examId], [field]: formattedValue },
    }))
  }

  const handleExamFinancialBlur = (examId: string, field: keyof FinancialDetails, value: string) => {
    if (field === "allowance" || field === "copay") {
      const formattedValue = formatCurrencyOnBlur(value)
      setExamFinancials((prev) => ({
        ...prev,
        [examId]: { ...prev[examId], [field]: formattedValue },
      }))
    }
  }

  const handleLensChange = (categoryId: string, value: string | boolean) => {
    setSelectedLenses((prev) => ({ ...prev, [categoryId]: value }))
    if (value && value !== "None" && !lensFinancials[categoryId]) {
      setLensFinancials((prev) => ({
        ...prev,
        [categoryId]: { allowance: "", discount: "", copay: "" },
      }))
    }
  }

  const handleLensFinancialChange = (categoryId: string, field: keyof FinancialDetails, value: string) => {
    let formattedValue = value
    if (field === "allowance" || field === "copay") {
      formattedValue = handleCurrencyInput(value)
    } else if (field === "discount") {
      formattedValue = formatPercentageInput(value)
    }

    setLensFinancials((prev) => ({
      ...prev,
      [categoryId]: { ...prev[categoryId], [field]: formattedValue },
    }))
  }

  const handleLensFinancialBlur = (categoryId: string, field: keyof FinancialDetails, value: string) => {
    if (field === "allowance" || field === "copay") {
      const formattedValue = formatCurrencyOnBlur(value)
      setLensFinancials((prev) => ({
        ...prev,
        [categoryId]: { ...prev[categoryId], [field]: formattedValue },
      }))
    }
  }

  const handleAddOn = () => {
    const newAddOn: AddOnWithFinancials = {
      id: Date.now(),
      optionId: 1,
      financials: { allowance: "", discount: "", copay: "" },
      expanded: false,
    }
    setAddOns([...addOns, newAddOn])
  }

  const handleRemoveAddOn = (id: number) => {
    setAddOns(addOns.filter((addOn) => addOn.id !== id))
  }

  const handleAddOnOptionChange = (addOnId: number, optionId: string) => {
    setAddOns(
      addOns.map((addOn) => {
        if (addOn.id === addOnId) {
          const newOptionId = Number.parseInt(optionId)
          const shouldExpand = newOptionId !== 1 && !addOn.expanded
          return { ...addOn, optionId: newOptionId, expanded: shouldExpand }
        }
        return addOn
      }),
    )
  }

  const handleAddOnFinancialChange = (addOnId: number, field: keyof FinancialDetails, value: string) => {
    let formattedValue = value
    if (field === "allowance" || field === "copay") {
      formattedValue = handleCurrencyInput(value)
    } else if (field === "discount") {
      formattedValue = formatPercentageInput(value)
    }

    setAddOns(
      addOns.map((addOn) =>
        addOn.id === addOnId ? { ...addOn, financials: { ...addOn.financials, [field]: formattedValue } } : addOn,
      ),
    )
  }

  const handleAddOnFinancialBlur = (addOnId: number, field: keyof FinancialDetails, value: string) => {
    if (field === "allowance" || field === "copay") {
      const formattedValue = formatCurrencyOnBlur(value)
      setAddOns(
        addOns.map((addOn) =>
          addOn.id === addOnId ? { ...addOn, financials: { ...addOn.financials, [field]: formattedValue } } : addOn,
        ),
      )
    }
  }

  const toggleAddOnExpanded = (addOnId: number) => {
    setAddOns(addOns.map((addOn) => (addOn.id === addOnId ? { ...addOn, expanded: !addOn.expanded } : addOn)))
  }

  const toggleExamExpanded = (examId: string) => {
    setExpandedExams((prev) => ({ ...prev, [examId]: !prev[examId] }))
  }

  const toggleLensExpanded = (categoryId: string) => {
    setExpandedLenses((prev) => ({ ...prev, [categoryId]: !prev[categoryId] }))
  }

  const handleSaveQuote = () => {
    if (!customerName.trim()) {
      alert("Please enter customer name")
      return
    }
    alert("Quote saved successfully!")
  }

  const resetCalculator = () => {
    setCustomerName("")
    setInsuranceType("other")
    setSelectedExams({})
    setExamFinancials({})
    setExpandedExams({})
    setFramePrice("")
    setFrameAllowance("")
    setFrameDiscount("")
    setFrameCopay("")
    setSelectedLenses({ "edge-polish": true })
    setLensFinancials({})
    setExpandedLenses({})
    setAddOns([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      <Navigation userName={userName} storeName={storeName} currentPage="calculator" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Glasses Calculator</h1>
              <p className="text-gray-600">Create comprehensive quotes for eyeglasses and related services</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Customer Information */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="customer-name" className="text-sm font-medium">
                    Customer Name *
                  </Label>
                  <Input
                    id="customer-name"
                    placeholder="Enter customer's full name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insurance" className="text-sm font-medium">
                    Insurance Type
                  </Label>
                  <Select value={insuranceType} onValueChange={setInsuranceType}>
                    <SelectTrigger className="h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500">
                      <SelectValue placeholder="Select insurance type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="other">Other Insurance</SelectItem>
                      <SelectItem value="vsp">VSP</SelectItem>
                      <SelectItem value="declining">Declining Balance</SelectItem>
                      <SelectItem value="no-insurance">No Insurance</SelectItem>
                      <SelectItem value="second-pair">Second Pair</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Eye Examinations */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Eye Examinations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {examOptions.map((exam) => (
                    <Card
                      key={exam.id}
                      className={`transition-all duration-200 ${
                        selectedExams[exam.id] ? "border-emerald-500 bg-emerald-50" : "border-gray-200"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          {/* Main exam selection */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                id={exam.id}
                                checked={selectedExams[exam.id] || false}
                                onCheckedChange={(checked) => handleExamToggle(exam.id, !!checked)}
                                className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                              />
                              <Label htmlFor={exam.id} className="text-base font-medium cursor-pointer">
                                {exam.name}
                              </Label>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-lg font-semibold text-emerald-600">${exam.price}</span>
                              {selectedExams[exam.id] && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`h-8 w-8 p-0 rounded-full transition-all duration-200 ${
                                    expandedExams[exam.id]
                                      ? "bg-emerald-100 hover:bg-emerald-200"
                                      : "bg-gray-100 hover:bg-gray-200"
                                  }`}
                                  onClick={() => toggleExamExpanded(exam.id)}
                                >
                                  {expandedExams[exam.id] ? (
                                    <ChevronUp className="h-4 w-4 text-emerald-600" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 text-gray-600" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Financial details */}
                          {selectedExams[exam.id] && expandedExams[exam.id] && (
                            <div className="space-y-3 bg-white rounded-lg p-4 border border-gray-100">
                              <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-sm text-gray-600">Allowance</Label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                      $
                                    </span>
                                    <Input
                                      type="text"
                                      placeholder="0.00"
                                      value={examFinancials[exam.id]?.allowance || ""}
                                      onChange={(e) => handleExamFinancialChange(exam.id, "allowance", e.target.value)}
                                      onBlur={(e) => handleExamFinancialBlur(exam.id, "allowance", e.target.value)}
                                      className="h-9 text-sm border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 pl-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm text-gray-600">Discount</Label>
                                  <div className="relative">
                                    <Input
                                      type="text"
                                      placeholder="0"
                                      value={examFinancials[exam.id]?.discount || ""}
                                      onChange={(e) => handleExamFinancialChange(exam.id, "discount", e.target.value)}
                                      className="h-9 text-sm border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 pr-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                      %
                                    </span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm text-gray-600">Copay</Label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                      $
                                    </span>
                                    <Input
                                      type="text"
                                      placeholder="0.00"
                                      value={examFinancials[exam.id]?.copay || ""}
                                      onChange={(e) => handleExamFinancialChange(exam.id, "copay", e.target.value)}
                                      onBlur={(e) => handleExamFinancialBlur(exam.id, "copay", e.target.value)}
                                      className="h-9 text-sm border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 pl-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Frame & Lens Configuration */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Frame & Lens Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Frame Details */}
                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Frame Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="frame-price" className="text-sm font-medium">
                          Frame Price *
                        </Label>
                        <Input
                          id="frame-price"
                          type="number"
                          placeholder="0.00"
                          value={framePrice}
                          onChange={(e) => setFramePrice(e.target.value)}
                          className="h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="frame-allowance" className="text-sm font-medium">
                          Allowance
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                            $
                          </span>
                          <Input
                            id="frame-allowance"
                            type="text"
                            placeholder="0.00"
                            value={frameAllowance}
                            onChange={(e) => setFrameAllowance(handleCurrencyInput(e.target.value))}
                            onBlur={(e) => setFrameAllowance(formatCurrencyOnBlur(e.target.value))}
                            className="h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 pl-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="frame-discount" className="text-sm font-medium">
                          Discount
                        </Label>
                        <div className="relative">
                          <Input
                            id="frame-discount"
                            type="text"
                            placeholder="0"
                            value={frameDiscount}
                            onChange={(e) => setFrameDiscount(formatPercentageInput(e.target.value))}
                            className="h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 pr-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                            %
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="frame-copay" className="text-sm font-medium">
                          Copay
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                            $
                          </span>
                          <Input
                            id="frame-copay"
                            type="text"
                            placeholder="0.00"
                            value={frameCopay}
                            onChange={(e) => setFrameCopay(handleCurrencyInput(e.target.value))}
                            onBlur={(e) => setFrameCopay(formatCurrencyOnBlur(e.target.value))}
                            className="h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 pl-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Lens Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {lensCategories.map((category) => (
                    <Card key={category.id} className="border-gray-200">
                      <CardHeader>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {category.type === "checkbox" ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Checkbox
                                  id={category.id}
                                  checked={!!selectedLenses[category.id]}
                                  onCheckedChange={(checked) => handleLensChange(category.id, !!checked)}
                                />
                                <Label htmlFor={category.id} className="text-base font-medium cursor-pointer">
                                  {category.name} ({formatCurrency(category.price || 0)})
                                </Label>
                              </div>
                              {selectedLenses[category.id] && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`h-8 w-8 p-0 rounded-full transition-all duration-200 ${
                                    expandedLenses[category.id]
                                      ? "bg-emerald-100 hover:bg-emerald-200"
                                      : "bg-gray-100 hover:bg-gray-200"
                                  }`}
                                  onClick={() => toggleLensExpanded(category.id)}
                                >
                                  {expandedLenses[category.id] ? (
                                    <ChevronUp className="h-4 w-4 text-emerald-600" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 text-gray-600" />
                                  )}
                                </Button>
                              )}
                            </div>

                            {selectedLenses[category.id] && expandedLenses[category.id] && (
                              <div className="space-y-3 bg-white rounded-lg p-4 border border-gray-100">
                                <div className="grid grid-cols-3 gap-3">
                                  <div className="space-y-1">
                                    <Label className="text-xs text-gray-600">Allowance</Label>
                                    <div className="relative">
                                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                                        $
                                      </span>
                                      <Input
                                        type="text"
                                        placeholder="0.00"
                                        value={lensFinancials[category.id]?.allowance || ""}
                                        onChange={(e) =>
                                          handleLensFinancialChange(category.id, "allowance", e.target.value)
                                        }
                                        onBlur={(e) =>
                                          handleLensFinancialBlur(category.id, "allowance", e.target.value)
                                        }
                                        className="h-8 text-sm border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 pl-6 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs text-gray-600">Discount</Label>
                                    <div className="relative">
                                      <Input
                                        type="text"
                                        placeholder="0"
                                        value={lensFinancials[category.id]?.discount || ""}
                                        onChange={(e) =>
                                          handleLensFinancialChange(category.id, "discount", e.target.value)
                                        }
                                        className="h-8 text-sm border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 pr-6 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                      />
                                      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                                        %
                                      </span>
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs text-gray-600">Copay</Label>
                                    <div className="relative">
                                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                                        $
                                      </span>
                                      <Input
                                        type="text"
                                        placeholder="0.00"
                                        value={lensFinancials[category.id]?.copay || ""}
                                        onChange={(e) =>
                                          handleLensFinancialChange(category.id, "copay", e.target.value)
                                        }
                                        onBlur={(e) => handleLensFinancialBlur(category.id, "copay", e.target.value)}
                                        className="h-8 text-sm border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 pl-6 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 mr-3">
                                <Select
                                  value={(selectedLenses[category.id] as string) || "None"}
                                  onValueChange={(value) => handleLensChange(category.id, value)}
                                >
                                  <SelectTrigger className="h-12">
                                    <SelectValue placeholder={`Select ${category.name.toLowerCase()}`} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {category.options?.map((option) => (
                                      <SelectItem key={option} value={option}>
                                        {option}
                                        {option !== "None" &&
                                          category.prices?.[option] &&
                                          ` - ${formatCurrency(category.prices[option])}`}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              {selectedLenses[category.id] && selectedLenses[category.id] !== "None" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`h-8 w-8 p-0 rounded-full transition-all duration-200 ${
                                    expandedLenses[category.id]
                                      ? "bg-emerald-100 hover:bg-emerald-200"
                                      : "bg-gray-100 hover:bg-gray-200"
                                  }`}
                                  onClick={() => toggleLensExpanded(category.id)}
                                >
                                  {expandedLenses[category.id] ? (
                                    <ChevronUp className="h-4 w-4 text-emerald-600" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 text-gray-600" />
                                  )}
                                </Button>
                              )}
                            </div>

                            {selectedLenses[category.id] &&
                              selectedLenses[category.id] !== "None" &&
                              expandedLenses[category.id] && (
                                <div className="space-y-3 bg-white rounded-lg p-4 border border-gray-100">
                                  <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                      <Label className="text-xs text-gray-600">Allowance</Label>
                                      <div className="relative">
                                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                                          $
                                        </span>
                                        <Input
                                          type="text"
                                          placeholder="0.00"
                                          value={lensFinancials[category.id]?.allowance || ""}
                                          onChange={(e) =>
                                            handleLensFinancialChange(category.id, "allowance", e.target.value)
                                          }
                                          onBlur={(e) =>
                                            handleLensFinancialBlur(category.id, "allowance", e.target.value)
                                          }
                                          className="h-8 text-sm border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 pl-6 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs text-gray-600">Discount</Label>
                                      <div className="relative">
                                        <Input
                                          type="text"
                                          placeholder="0"
                                          value={lensFinancials[category.id]?.discount || ""}
                                          onChange={(e) =>
                                            handleLensFinancialChange(category.id, "discount", e.target.value)
                                          }
                                          className="h-8 text-sm border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 pr-6 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                                          %
                                        </span>
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs text-gray-600">Copay</Label>
                                      <div className="relative">
                                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                                          $
                                        </span>
                                        <Input
                                          type="text"
                                          placeholder="0.00"
                                          value={lensFinancials[category.id]?.copay || ""}
                                          onChange={(e) =>
                                            handleLensFinancialChange(category.id, "copay", e.target.value)
                                          }
                                          onBlur={(e) => handleLensFinancialBlur(category.id, "copay", e.target.value)}
                                          className="h-8 text-sm border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 pl-6 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Add-Ons */}
                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Add-Ons</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {addOns.map((addOn) => {
                      const selectedOption = addOnOptions.find((opt) => opt.id === addOn.optionId)
                      const hasFinancialOptions = selectedOption && selectedOption.id !== 1

                      return (
                        <div key={addOn.id} className="space-y-4">
                          <div className="flex items-center gap-4">
                            <Select
                              value={addOn.optionId.toString()}
                              onValueChange={(value) => handleAddOnOptionChange(addOn.id, value)}
                            >
                              <SelectTrigger className="h-12 flex-1">
                                <SelectValue placeholder="Select an add-on" />
                              </SelectTrigger>
                              <SelectContent>
                                {addOnOptions.map((opt) => (
                                  <SelectItem key={opt.id} value={opt.id.toString()}>
                                    {opt.name} ({formatCurrency(opt.price)})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {hasFinancialOptions && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-8 w-8 p-0 rounded-full transition-all duration-200 ${
                                  addOn.expanded
                                    ? "bg-emerald-100 hover:bg-emerald-200"
                                    : "bg-gray-100 hover:bg-gray-200"
                                }`}
                                onClick={() => toggleAddOnExpanded(addOn.id)}
                              >
                                {addOn.expanded ? (
                                  <ChevronUp className="h-4 w-4 text-emerald-600" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-gray-600" />
                                )}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveAddOn(addOn.id)}
                              className="text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          {hasFinancialOptions && addOn.expanded && (
                            <div className="space-y-3 bg-white rounded-lg p-4 border border-gray-100 ml-4">
                              <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1">
                                  <Label className="text-xs text-gray-600">Allowance</Label>
                                  <div className="relative">
                                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                                      $
                                    </span>
                                    <Input
                                      type="text"
                                      placeholder="0.00"
                                      value={addOn.financials.allowance}
                                      onChange={(e) =>
                                        handleAddOnFinancialChange(addOn.id, "allowance", e.target.value)
                                      }
                                      onBlur={(e) => handleAddOnFinancialBlur(addOn.id, "allowance", e.target.value)}
                                      className="h-8 text-sm border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 pl-6 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs text-gray-600">Discount</Label>
                                  <div className="relative">
                                    <Input
                                      type="text"
                                      placeholder="0"
                                      value={addOn.financials.discount}
                                      onChange={(e) => handleAddOnFinancialChange(addOn.id, "discount", e.target.value)}
                                      className="h-8 text-sm border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 pr-6 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                                      %
                                    </span>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs text-gray-600">Copay</Label>
                                  <div className="relative">
                                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                                      $
                                    </span>
                                    <Input
                                      type="text"
                                      placeholder="0.00"
                                      value={addOn.financials.copay}
                                      onChange={(e) => handleAddOnFinancialChange(addOn.id, "copay", e.target.value)}
                                      onBlur={(e) => handleAddOnFinancialBlur(addOn.id, "copay", e.target.value)}
                                      className="h-8 text-sm border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 pl-6 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                    <Button variant="outline" onClick={handleAddOn} className="w-full bg-transparent">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Add-On
                    </Button>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <Button
                onClick={resetCalculator}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
              >
                Reset Calculator
              </Button>
              <Button onClick={handleSaveQuote} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Save Quote
              </Button>
            </div>
          </div>

          {/* Quote Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Calculator className="w-5 h-5 mr-2 text-emerald-600" />
                  Quote Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {customerName && (
                  <div>
                    <Label className="text-xs text-gray-500 uppercase tracking-wide">Customer</Label>
                    <p className="font-medium">{customerName}</p>
                  </div>
                )}
                <Separator />
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {summary.items.length > 0 ? (
                    summary.items.map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm truncate pr-2">{item.name}</span>
                          <span className="font-medium text-sm">{item.price}</span>
                        </div>
                        {item.details && <p className="text-xs text-gray-500 italic">{item.details}</p>}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No items selected.</p>
                  )}
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Retail Total</span>
                    <span>{formatCurrency(summary.retailTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Insurance Savings</span>
                    <span>-{formatCurrency(summary.insuranceSavings)}</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Final Cost</span>
                  <span className="text-2xl font-bold text-emerald-600">{formatCurrency(summary.finalCost)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
