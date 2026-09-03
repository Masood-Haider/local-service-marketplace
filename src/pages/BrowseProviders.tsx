import React, { useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
import {
  fetchProvidersWithQuery,
  ProviderProfile,
  ProviderSortOption,
} from "@/services/providerService"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import {
  Search,
  MapPin,
  Star,
  ShieldCheck,
  ArrowRight,
  DollarSign,
  PlusCircle,
  Briefcase,
  SlidersHorizontal,
  X,
} from "lucide-react"

export const BrowseProviders: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const initialCategory = searchParams.get("category") || "All"
  const initialQuery = searchParams.get("q") || ""
  const initialSort = (searchParams.get("sort") as ProviderSortOption) || "rating_desc"

  const [searchTerm, setSearchTerm] = useState(initialQuery)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [sortBy, setSortBy] = useState<ProviderSortOption>(initialSort)

  const [providers, setProviders] = useState<ProviderProfile[]>([])
  const [loading, setLoading] = useState(true)

  const categories = [
    "All",
    "Plumbing",
    "Electrical",
    "Cleaning",
    "Tutoring",
    "Moving",
    "HVAC",
    "Carpentry",
    "Painting",
  ]

  // Synchronize URL parameters with local state
  useEffect(() => {
    const cat = searchParams.get("category")
    if (cat && cat !== selectedCategory) setSelectedCategory(cat)
    const q = searchParams.get("q")
    if (q !== null && q !== searchTerm) setSearchTerm(q)
    const sort = searchParams.get("sort") as ProviderSortOption
    if (sort && sort !== sortBy) setSortBy(sort)
  }, [searchParams])

  // Execute Firestore query
  useEffect(() => {
    let isMounted = true
    async function loadProviders() {
      setLoading(true)
      try {
        const data = await fetchProvidersWithQuery({
          category: selectedCategory === "All" ? undefined : selectedCategory,
          sortBy,
          searchTerm,
        })
        if (isMounted) {
          setProviders(data)
        }
      } catch (err) {
        console.error("Failed to query providers:", err)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadProviders()
    return () => {
      isMounted = false
    }
  }, [selectedCategory, sortBy, searchTerm])

  const updateUrlParams = (newCat: string, newSort: string, newSearch: string) => {
    const params = new URLSearchParams()
    if (newCat && newCat !== "All") params.set("category", newCat)
    if (newSort && newSort !== "rating_desc") params.set("sort", newSort)
    if (newSearch && newSearch.trim()) params.set("q", newSearch.trim())
    setSearchParams(params)
  }

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat)
    updateUrlParams(cat, sortBy, searchTerm)
  }

  const handleSortChange = (sort: ProviderSortOption) => {
    setSortBy(sort)
    updateUrlParams(selectedCategory, sort, searchTerm)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateUrlParams(selectedCategory, sortBy, searchTerm)
  }

  const clearFilters = () => {
    setSelectedCategory("All")
    setSortBy("rating_desc")
    setSearchTerm("")
    setSearchParams(new URLSearchParams())
  }

  const hasActiveFilters = selectedCategory !== "All" || searchTerm.trim().length > 0 || sortBy !== "rating_desc"

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <PageHeader
        title="Find & Hire Verified Local Pros"
        description="Search licensed, background-checked trade professionals with transparent pricing and verified customer ratings."
        action={
          <Link to="/post-job">
            <Button className="gap-2 shadow-sm shadow-primary/20">
              <PlusCircle className="w-4 h-4" /> Post a Job Instead
            </Button>
          </Link>
        }
      />

      {/* SEARCH, CATEGORY DROPDOWN & SORT BAR */}
      <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by pro name, skill, or keyword (e.g. Faucet, Wiring, Tutor)..."
              className="pl-10 h-11 text-sm rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("")
                  updateUrlParams(selectedCategory, sortBy, "")
                }}
                className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Dropdown (shadcn Select) */}
          <div className="w-full md:w-56">
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "All" ? "All Categories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort Dropdown (shadcn Select) */}
          <div className="w-full md:w-56">
            <Select value={sortBy} onValueChange={(val) => handleSortChange(val as ProviderSortOption)}>
              <SelectTrigger className="h-11 rounded-xl">
                <SlidersHorizontal className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating_desc">Highest Rated</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="reviews_desc">Most Reviews</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="h-11 px-6 rounded-xl font-medium">
            Search
          </Button>
        </form>

        {/* Quick Category Badges Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3 border-t border-border/60">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
            Filter:
          </span>
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={selectedCategory.toLowerCase() === cat.toLowerCase() ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap py-1 px-3 text-xs rounded-lg transition-colors"
              onClick={() => handleCategoryChange(cat)}
            >
              {cat}
            </Badge>
          ))}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs text-muted-foreground hover:text-foreground h-7 ml-auto shrink-0 gap-1"
            >
              <X className="w-3.5 h-3.5" /> Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* PROVIDER CARDS GRID */}
      {loading ? (
        /* LOADING SKELETONS USING SHADCN SKELETON */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Card key={n} className="border-border p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-14 w-14 rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
              <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            </Card>
          ))}
        </div>
      ) : providers.length > 0 ? (
        /* POPULATED PROVIDERS GRID */
        <div>
          <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
            <span>
              Showing <strong className="text-foreground">{providers.length}</strong> verified provider{providers.length === 1 ? "" : "s"}
            </span>
            {selectedCategory !== "All" && (
              <span>Category: <strong className="text-primary">{selectedCategory}</strong></span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <Card
                key={provider.uid}
                className="hover:shadow-lg transition-all duration-300 border-border bg-card flex flex-col justify-between overflow-hidden group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <Avatar className="h-14 w-14 rounded-2xl border border-border shadow-xs">
                        <AvatarImage src={provider.photoURL} alt={provider.name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-extrabold text-base">
                          {provider.name?.[0]?.toUpperCase() || "P"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">
                          {provider.name}
                        </CardTitle>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Badge variant="outline" className="text-xs font-semibold text-primary border-primary/30">
                            {provider.category}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span className="truncate max-w-[110px]">{provider.serviceArea}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md text-xs font-bold shrink-0">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{provider.avgRating || "5.0"}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-1">
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {provider.bio || "Certified trade professional available for residential repairs, diagnostic visits, and emergency callouts."}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-1 text-foreground font-semibold">
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                      <span>{provider.priceRange}</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Pro
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="border-t border-border/60 pt-4 flex items-center justify-between gap-2 bg-muted/10">
                  <span className="text-xs text-muted-foreground">
                    {provider.portfolioImages?.length || 0} work samples
                  </span>

                  <div className="flex items-center gap-2">
                    <Link to={`/providers/${provider.uid}`}>
                      <Button size="sm" className="gap-1.5 text-xs h-9 px-3 rounded-lg font-medium shadow-xs">
                        View Profile <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        /* EMPTY STATE ("NO PROVIDERS FOUND") */
        <EmptyState
          icon={Briefcase}
          title="No Service Providers Found"
          description={
            hasActiveFilters
              ? "We couldn't find any service providers matching your current search and filter criteria."
              : "No service providers have completed onboarding yet in this marketplace."
          }
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              )}
              <Link to="/post-job">
                <Button className="gap-2">
                  <PlusCircle className="w-4 h-4" /> Post a Job Request
                </Button>
              </Link>
            </div>
          }
        />
      )}
    </div>
  )
}
