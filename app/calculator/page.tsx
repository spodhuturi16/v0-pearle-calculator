"use client"

import { useState, useMemo } from "react"
import { Eye, Calculator, ShoppingCart, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Navigation } from "@/components/navigation"

const examOptions = [
  { id: "eye-exam", name: "Comprehensive Eye Exam", price: 89 },
  { id: "contact-exam", name: "Contact Lens Exam", price: 45 },
  { id: "refraction", name: "Refraction Test", price: 25 },
  { id: "retinal-photos", name: "Retinal Fundus Photos", price: 35 },
]

const lensCategories = [
  { id: "lens-type", name: "Lens Type", options: ["None", "Single Vision", "Bifocal", "Progressive"] },
  { id: "material", name: "Material", options: ["None", "Standard Plastic", "Polycarbonate", "High Index"] },
  { id: "coatings", name: "Coatings", options: ["None", "Anti-Reflective", "Scratch Resistant", "UV Protection"] },
  { id: "edge-polish", name: "Edge Polish", type: "checkbox", price: 20 },
  { id: "protection", name: "1-Year Protection", type: "checkbox", price: 50 },
]

const addOnOptions = [
  { id: 1, name: "None", price: 0 },
  { id: 2, name: "Custom Tint", price: 40 },
  { id: 3, name: "Premium Case", price: 25 },
]

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)

export default function CalculatorPage() {
  const [customerName, setCustomerName] = useState("")
  const [insuranceType, setInsuranceType] = useState("other")
  const [selectedExams, setSelectedExams] = useState<Record<string, boolean>>({})
  const [framePrice, setFramePrice] = useState("")
  const [frameAllowance, setFrameAllowance] = useState("")
  const [frameDiscount, setFrameDiscount] = useState("")
  const [selectedLenses, setSelectedLenses] = useState<Record<string, string | boolean>>({ "edge-polish": true })
  const [addOns, setAddOns] = useState<Array<{ id: number; optionId: number }>>([])
  const [userName] = useState("John Smith")
  const [storeName] = useState("Downtown Vision Center")

  const summary = useMemo(() => {
    let retailTotal = 0
    let finalCost = 0
    const items: Array<{ name: string; price: string }> = []

    // Exams
    examOptions.forEach((exam) => {
      if (selectedExams[exam.id]) {
        retailTotal += exam.price
        finalCost += exam.price
        items.push({ name: exam.name, price: formatCurrency(exam.price) })
      }
    })

    // Frame
    const frameRetail = Number.parseFloat(framePrice) || 0
    if (frameRetail > 0) {
      const allowance = Number.parseFloat(frameAllowance) || 0
      const discount = Number.parseFloat(frameDiscount) || 0
      const frameCost = (frameRetail - allowance) * (1 - discount / 100)
      retailTotal += frameRetail
      finalCost += Math.max(0, frameCost)
      items.push({ name: "Frame", price: formatCurrency(frameCost) })
    }

    // Lenses
    lensCategories.forEach((category) => {
      const selection = selectedLenses[category.id]
      if (category.type === "checkbox" && selection) {
        const price = category.price || 0
        retailTotal += price
        finalCost += price
        items.push({ name: category.name, price: formatCurrency(price) })
      }
    })

    // Add-Ons
    addOns.forEach((addOn) => {
      const option = addOnOptions.find((opt) => opt.id === addOn.optionId)
      if (option && option.price > 0) {
        retailTotal += option.price
        finalCost += option.price
        items.push({ name: option.name, price: formatCurrency(option.price) })
      }
    })

    const insuranceSavings = retailTotal - finalCost

    return { retailTotal, finalCost, insuranceSavings, items }
  }, [selectedExams, framePrice, frameAllowance, frameDiscount, selectedLenses, addOns])

  const handleAddOn = () => {
    setAddOns([...addOns, { id: Date.now(), optionId: 1 }])
  }

  const handleRemoveAddOn = (id: number) => {
    setAddOns(addOns.filter((addOn) => addOn.id !== id))
  }

  const handleAddOnOptionChange = (addOnId: number, optionId: string) => {
    setAddOns(addOns.map((addOn) => (addOn.id === addOnId ? { ...addOn, optionId: Number.parseInt(optionId) } : addOn)))
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
    setFramePrice("")
    setFrameAllowance("")
    setFrameDiscount("")
    setSelectedLenses({ "edge-polish": true })
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
            <Tabs value="glasses" className="w-auto">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="glasses"
                  className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Glasses
                </TabsTrigger>
                <TabsTrigger value="contacts" onClick={() => (window.location.href = "/contacts")}>
                  <Calculator className="w-4 h-4 mr-2" />
                  Contacts
                </TabsTrigger>
              </TabsList>
            </Tabs>
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
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedExams[exam.id]
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 hover:border-emerald-300"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id={exam.id}
                              checked={selectedExams[exam.id] || false}
                              onCheckedChange={(checked) =>
                                setSelectedExams((prev) => ({ ...prev, [exam.id]: !!checked }))
                              }
                              className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                            />
                            <Label htmlFor={exam.id} className="text-base font-medium cursor-pointer">
                              {exam.name}
                            </Label>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-semibold text-emerald-600">${exam.price}</span>
                          </div>
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
                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <Input
                        id="frame-allowance"
                        type="number"
                        placeholder="0.00"
                        value={frameAllowance}
                        onChange={(e) => setFrameAllowance(e.target.value)}
                        className="h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="frame-discount" className="text-sm font-medium">
                        Discount (%)
                      </Label>
                      <Input
                        id="frame-discount"
                        type="number"
                        placeholder="0"
                        value={frameDiscount}
                        onChange={(e) => setFrameDiscount(e.target.value)}
                        className="h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
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
                      <CardContent>
                        {category.type === "checkbox" ? (
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id={category.id}
                              checked={!!selectedLenses[category.id]}
                              onCheckedChange={(checked) =>
                                setSelectedLenses((prev) => ({ ...prev, [category.id]: !!checked }))
                              }
                            />
                            <Label htmlFor={category.id} className="text-base font-medium cursor-pointer">
                              {category.name} ({formatCurrency(category.price || 0)})
                            </Label>
                          </div>
                        ) : (
                          <Select
                            value={(selectedLenses[category.id] as string) || "None"}
                            onValueChange={(value) => setSelectedLenses((prev) => ({ ...prev, [category.id]: value }))}
                          >
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder={`Select ${category.name.toLowerCase()}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {category.options?.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                    {addOns.map((addOn) => (
                      <div key={addOn.id} className="flex items-center gap-4">
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveAddOn(addOn.id)}
                          className="text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
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
                      <div key={index} className="flex justify-between">
                        <span className="text-sm truncate pr-2">{item.name}</span>
                        <span className="font-medium text-sm">{item.price}</span>
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
