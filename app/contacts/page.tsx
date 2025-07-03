"use client"

import { useState, useMemo } from "react"
import { Eye, Calculator, ShoppingCart, Contact } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
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

export default function ContactsPage() {
  const [customerName, setCustomerName] = useState("")
  const [insuranceType, setInsuranceType] = useState("other")
  const [selectedLensId, setSelectedLensId] = useState<string | undefined>(undefined)
  const [wearerType, setWearerType] = useState("new")
  const [visionBenefit, setVisionBenefit] = useState("")
  const [selectedExams, setSelectedExams] = useState<Record<string, boolean>>({})
  const [selectedSupply, setSelectedSupply] = useState<string | undefined>(undefined)
  const [userName] = useState("John Smith")
  const [storeName] = useState("Downtown Vision Center")

  const examTotal = useMemo(() => {
    return examOptions.reduce((total, exam) => (selectedExams[exam.id] ? total + exam.price : total), 0)
  }, [selectedExams])

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
    setSelectedLensId(undefined)
    setWearerType("new")
    setVisionBenefit("")
    setSelectedExams({})
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
            <Tabs value="contacts" className="w-auto">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="glasses" onClick={() => (window.location.href = "/calculator")}>
                  <Eye className="w-4 h-4 mr-2" />
                  Glasses
                </TabsTrigger>
                <TabsTrigger
                  value="contacts"
                  className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
                >
                  <Contact className="w-4 h-4 mr-2" />
                  Contacts
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
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

            {/* Contact Lens Configuration */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Contact Lens Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <Label htmlFor="vision-benefit" className="text-sm font-medium">
                      Vision Plan Benefit
                    </Label>
                    <Input
                      id="vision-benefit"
                      type="number"
                      placeholder="0.00"
                      value={visionBenefit}
                      onChange={(e) => setVisionBenefit(e.target.value)}
                      className="h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Wearer Type</Label>
                  <RadioGroup value={wearerType} onValueChange={setWearerType} className="flex space-x-6">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="new" id="new-wearer" />
                      <Label htmlFor="new-wearer">New Wearer</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="current" id="current-wearer" />
                      <Label htmlFor="current-wearer">Current Wearer</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Supply Comparison */}
            {summary && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Supply Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={selectedSupply} onValueChange={setSelectedSupply}>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead></TableHead>
                          <TableHead className="text-center">3 Month</TableHead>
                          <TableHead className="text-center">6 Month</TableHead>
                          <TableHead className="text-center text-emerald-600 font-bold">Annual</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Select Supply</TableCell>
                          {Object.keys(summary.results).map((key) => (
                            <TableCell key={key} className="text-center">
                              <RadioGroupItem value={key} id={`supply-${key}`} />
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Total Cost</TableCell>
                          {Object.values(summary.results).map((r, i) => (
                            <TableCell key={i} className="text-center">
                              {formatCurrency(r.totalCost)}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-green-600">Benefit/Rebate</TableCell>
                          {Object.values(summary.results).map((r, i) => (
                            <TableCell key={i} className="text-center text-green-600">
                              -{formatCurrency(r.benefit + r.rebate)}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-green-600">Store Discount</TableCell>
                          {Object.values(summary.results).map((r, i) => (
                            <TableCell key={i} className="text-center text-green-600">
                              -{formatCurrency(r.storeDiscount)}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Exam Total</TableCell>
                          <TableCell colSpan={3} className="text-center">
                            {formatCurrency(examTotal)}
                          </TableCell>
                        </TableRow>
                        <TableRow className="font-bold text-lg">
                          <TableCell>Final Total</TableCell>
                          {Object.values(summary.results).map((r, i) => (
                            <TableCell key={i} className={`text-center ${i === 2 ? "text-emerald-600" : ""}`}>
                              {formatCurrency(r.finalCost)}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </RadioGroup>
                </CardContent>
              </Card>
            )}

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
                {summary && selectedSupply && (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-500 uppercase tracking-wide">Selected Lens</Label>
                      <p className="font-medium">{summary.lens.name}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 uppercase tracking-wide">Supply Option</Label>
                      <p className="font-medium">{summary.results[selectedSupply]?.label}</p>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Final Total</span>
                      <span className="text-2xl font-bold text-emerald-600">
                        {formatCurrency(summary.results[selectedSupply]?.finalCost || 0)}
                      </span>
                    </div>
                  </div>
                )}
                {!summary && <p className="text-sm text-gray-500">Select a contact lens to see pricing options.</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
