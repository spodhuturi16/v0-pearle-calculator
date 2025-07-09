"use client"

import { useState, useMemo, useEffect } from "react"
import { ShoppingCart, Contact, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Navigation } from "@/components/navigation"

const mockContactLenses = [
  { id: 1, name: "Acuvue Oasys", brand: "Johnson & Johnson", price: 45.99, type: "Daily", rebate: 50 },
  { id: 2, name: "Biofinity", brand: "CooperVision", price: 38.99, type: "Monthly", rebate: 75 },
  { id: 3, name: "Air Optix", brand: "Alcon", price: 42.99, type: "Monthly", rebate: 60 },
]

const examOptions = [
  { id: "eye-exam", name: "Comprehensive Eye Exam", price: 89 },
  { id: "contact-exam", name: "Contact Lens Exam", price: 45 },
  { id: "refraction", name: "Refraction Test", price: 25 },
  { id: "retinal-photos", name: "Retinal Fundus Photos", price: 35 },
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

export default function ContactsPage() {
  const [customerName, setCustomerName] = useState("")
  const [insuranceType, setInsuranceType] = useState("other")
  const [selectedExams, setSelectedExams] = useState<Record<string, boolean>>({})
  const [examFinancials, setExamFinancials] = useState<Record<string, FinancialDetails>>({})
  const [expandedExams, setExpandedExams] = useState<Record<string, boolean>>({})

  const [selectedLensId, setSelectedLensId] = useState<string | undefined>(undefined)
  const [lensType, setLensType] = useState("")
  const [wearerType, setWearerType] = useState(false) // false = new, true = current
  const [visionBenefit, setVisionBenefit] = useState("")
  const [selectedSupply, setSelectedSupply] = useState<string | undefined>(undefined)
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

  const examTotal = useMemo(() => {
    return examOptions.reduce((total, exam) => {
      if (selectedExams[exam.id]) {
        const financials = examFinancials[exam.id] || { allowance: "", discount: "", copay: "" }
        const allowance = Number.parseFloat(financials.allowance || "0")
        const discount = Number.parseFloat(financials.discount || "0")
        const copay = Number.parseFloat(financials.copay || "0")

        const discountedPrice = exam.price * (1 - discount / 100)
        const afterAllowance = Math.max(0, discountedPrice - allowance)
        const finalPrice = afterAllowance + copay

        return total + finalPrice
      }
      return total
    }, 0)
  }, [selectedExams, examFinancials])

  const summary = useMemo(() => {
    const lens = mockContactLenses.find((l) => l.id.toString() === selectedLensId)
    if (!lens) return null

    const benefit = Number.parseFloat(visionBenefit) || 0
    const taxRate = 0.06
    const storeDiscountPercent = 0.05

    const supplies = {
      "3m": { boxes: 2, months: 3, label: "3 Month" },
      "6m": { boxes: 4, months: 6, label: "6 Month" },
      annual: { boxes: 8, months: 12, label: "Annual" },
    }

    const results: Record<string, any> = {}

    for (const [key, value] of Object.entries(supplies)) {
      const totalCost = lens.price * value.boxes
      const rebate = key === "annual" ? lens.rebate : 0
      const storeDiscount = key === "annual" ? (totalCost - benefit - rebate) * storeDiscountPercent : 0
      const subtotal = totalCost - benefit - rebate - storeDiscount
      const tax = subtotal > 0 ? subtotal * taxRate : 0
      const finalCost = subtotal + tax + examTotal

      results[key] = {
        ...value,
        boxes: value.boxes,
        totalCost,
        benefit,
        rebate,
        storeDiscount,
        tax,
        finalCost,
      }
    }
    return { lens, results }
  }, [selectedLensId, visionBenefit, examTotal])

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

  const toggleExamExpanded = (examId: string) => {
    setExpandedExams((prev) => ({ ...prev, [examId]: !prev[examId] }))
  }

  const handleSaveQuote = () => {
    if (!customerName.trim()) {
      alert("Please enter customer name")
      return
    }
    if (!selectedLensId) {
      alert("Please select a contact lens")
      return
    }
    if (!selectedSupply) {
      alert("Please select a supply option")
      return
    }
    alert("Contact lens quote saved successfully!")
  }

  const resetCalculator = () => {
    setCustomerName("")
    setInsuranceType("other")
    setSelectedExams({})
    setExamFinancials({})
    setExpandedExams({})
    setSelectedLensId(undefined)
    setLensType("")
    setWearerType(false)
    setVisionBenefit("")
    setSelectedSupply(undefined)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      <Navigation userName={userName} storeName={storeName} currentPage="contacts" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Lens Calculator</h1>
              <p className="text-gray-600">Create comprehensive quotes for contact lenses and related services</p>
            </div>
            <Tabs value="contacts" className="w-auto"></Tabs>
          </div>
        </div>

        <div className="space-y-8">
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

          {/* Contact Lens Configuration and Supply Options */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Contact Lens Configuration */}
            <div className="lg:col-span-2">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Contact Lens Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-lens" className="text-sm font-medium">
                        Contact Lens Brand & Type *
                      </Label>
                      <Select value={selectedLensId} onValueChange={setSelectedLensId}>
                        <SelectTrigger className="h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500">
                          <SelectValue placeholder="Select contact lens" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockContactLenses.map((lens) => (
                            <SelectItem key={lens.id} value={lens.id.toString()}>
                              {lens.name} - {lens.brand}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lens-type" className="text-sm font-medium">
                        Lens Type
                      </Label>
                      <div className="h-12 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 flex items-center">
                        <span className="text-gray-500 text-sm italic">
                          Will be populated from backend based on selection
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vision-benefit" className="text-sm font-medium">
                        Vision Plan Benefit
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                          $
                        </span>
                        <Input
                          id="vision-benefit"
                          type="text"
                          placeholder="0.00"
                          value={visionBenefit}
                          onChange={(e) => setVisionBenefit(handleCurrencyInput(e.target.value))}
                          onBlur={(e) => setVisionBenefit(formatCurrencyOnBlur(e.target.value))}
                          className="h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 pl-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Wearer Type</Label>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="wearer-toggle" className="text-sm">
                          New Wearer
                        </Label>
                        <Switch id="wearer-toggle" checked={wearerType} onCheckedChange={setWearerType} />
                        <Label htmlFor="wearer-toggle" className="text-sm">
                          Current Wearer
                        </Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Supply Options */}
            <div className="lg:col-span-3">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Supply Options</CardTitle>
                </CardHeader>
                <CardContent>
                  {summary ? (
                    <div className="space-y-6">
                      {/* Supply Selection Grid */}
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-4 font-medium text-gray-700 w-1/4"></th>
                              <th className="text-center py-3 px-4 font-medium text-gray-700 w-1/4">3 Months</th>
                              <th className="text-center py-3 px-4 font-medium text-gray-700 w-1/4">6 Months</th>
                              <th className="text-center py-3 px-4 font-medium text-gray-700 text-emerald-600 w-1/4">
                                Annual
                                <br />
                                <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                                  Best Value
                                </span>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            <tr>
                              <td className="py-3 px-4 font-medium text-gray-900">Select Supply</td>
                              {Object.keys(summary.results).map((key) => (
                                <td key={key} className="py-3 px-4 text-center">
                                  <div className="flex justify-center">
                                    <div
                                      className={`w-5 h-5 rounded-full border-2 cursor-pointer transition-all duration-200 flex items-center justify-center ${
                                        selectedSupply === key
                                          ? "border-emerald-500 bg-emerald-500"
                                          : "border-gray-300 hover:border-emerald-400"
                                      }`}
                                      onClick={() => setSelectedSupply(key)}
                                    >
                                      {selectedSupply === key && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                    </div>
                                  </div>
                                </td>
                              ))}
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="py-3 px-4 font-medium text-gray-700">Boxes Included</td>
                              {Object.values(summary.results).map((result, i) => (
                                <td key={i} className="py-3 px-4 text-center font-medium">
                                  {result.boxes}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <td className="py-3 px-4 text-gray-700">Price Per Box</td>
                              {Object.values(summary.results).map((result, i) => (
                                <td key={i} className="py-3 px-4 text-center font-medium">
                                  {formatCurrency(summary.lens.price)}
                                </td>
                              ))}
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="py-3 px-4 text-gray-700">Total Cost</td>
                              {Object.values(summary.results).map((result, i) => (
                                <td key={i} className="py-3 px-4 text-center font-medium">
                                  {formatCurrency(result.totalCost)}
                                </td>
                              ))}
                            </tr>
                            {summary.results["3m"].benefit > 0 && (
                              <tr>
                                <td className="py-3 px-4 text-green-600">Vision Plan Benefit</td>
                                {Object.values(summary.results).map((result, i) => (
                                  <td key={i} className="py-3 px-4 text-center text-green-600 font-medium">
                                    -{formatCurrency(result.benefit)}
                                  </td>
                                ))}
                              </tr>
                            )}
                            <tr className="bg-gray-50">
                              <td className="py-3 px-4 text-green-600">MFR Rebate</td>
                              {Object.values(summary.results).map((result, i) => (
                                <td key={i} className="py-3 px-4 text-center text-green-600 font-medium">
                                  {result.rebate > 0 ? `-${formatCurrency(result.rebate)}` : "-"}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <td className="py-3 px-4 text-green-600">Store Discount</td>
                              {Object.values(summary.results).map((result, i) => (
                                <td key={i} className="py-3 px-4 text-center text-green-600 font-medium">
                                  {result.storeDiscount > 0 ? `-${formatCurrency(result.storeDiscount)}` : "-"}
                                </td>
                              ))}
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="py-3 px-4 text-gray-700">Sales Tax</td>
                              {Object.values(summary.results).map((result, i) => (
                                <td key={i} className="py-3 px-4 text-center">
                                  {formatCurrency(result.tax)}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <td className="py-3 px-4 text-gray-700">Cost Per Box</td>
                              {Object.values(summary.results).map((result, i) => (
                                <td key={i} className="py-3 px-4 text-center font-medium">
                                  {formatCurrency(
                                    (result.totalCost -
                                      result.benefit -
                                      result.rebate -
                                      result.storeDiscount +
                                      result.tax) /
                                      result.boxes,
                                  )}
                                </td>
                              ))}
                            </tr>
                            {examTotal > 0 && (
                              <tr className="bg-gray-50">
                                <td className="py-3 px-4 text-gray-700">Exam Fee</td>
                                {Object.values(summary.results).map((result, i) => (
                                  <td key={i} className="py-3 px-4 text-center font-medium">
                                    {formatCurrency(examTotal)}
                                  </td>
                                ))}
                              </tr>
                            )}
                            <tr className="border-t-2 border-gray-300 bg-emerald-50">
                              <td className="py-4 px-4 font-bold text-lg text-gray-900">Final Total</td>
                              {Object.values(summary.results).map((result, i) => (
                                <td key={i} className="py-4 px-4 text-center">
                                  <div className="text-xl font-bold text-emerald-600">
                                    {formatCurrency(result.finalCost)}
                                  </div>
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Contact className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Contact Lens Selected</h3>
                      <p className="text-gray-500">Select a contact lens brand to view supply options and pricing</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

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
      </div>
    </div>
  )
}
