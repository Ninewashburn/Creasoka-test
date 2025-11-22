"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AdvancedSearchProps {
    onSearch: (filters: SearchFilters) => void;
    initialFilters?: SearchFilters;
}

export interface SearchFilters {
    query: string;
    minPrice: number;
    maxPrice: number;
    sort: "newest" | "oldest" | "price-asc" | "price-desc";
}

export default function AdvancedSearch({
    onSearch,
    initialFilters,
}: AdvancedSearchProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState<SearchFilters>(
        initialFilters || {
            query: "",
            minPrice: 0,
            maxPrice: 200,
            sort: "newest",
        }
    );

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(filters);
        }, 300);

        return () => clearTimeout(timer);
    }, [filters, onSearch]);

    const handleReset = () => {
        setFilters({
            query: "",
            minPrice: 0,
            maxPrice: 200,
            sort: "newest",
        });
    };

    return (
        <div className="w-full max-w-4xl mx-auto mb-8">
            <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        type="text"
                        placeholder="Rechercher..."
                        className="pl-10"
                        value={filters.query}
                        onChange={(e) =>
                            setFilters((prev) => ({ ...prev, query: e.target.value }))
                        }
                    />
                    {filters.query && (
                        <button
                            onClick={() => setFilters((prev) => ({ ...prev, query: "" }))}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <Button
                    variant={isOpen ? "secondary" : "outline"}
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex gap-2"
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filtres
                </Button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">
                                        Prix ({filters.minPrice}€ - {filters.maxPrice}€)
                                    </label>
                                    <Slider
                                        defaultValue={[filters.minPrice, filters.maxPrice]}
                                        max={200}
                                        step={5}
                                        onValueChange={(value) =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                minPrice: value[0],
                                                maxPrice: value[1],
                                            }))
                                        }
                                        className="py-4"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">
                                        Trier par
                                    </label>
                                    <Select
                                        value={filters.sort}
                                        onValueChange={(value: "newest" | "oldest" | "price-asc" | "price-desc") =>
                                            setFilters((prev) => ({ ...prev, sort: value }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Trier par..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="newest">Plus récents</SelectItem>
                                            <SelectItem value="oldest">Plus anciens</SelectItem>
                                            <SelectItem value="price-asc">Prix croissant</SelectItem>
                                            <SelectItem value="price-desc">Prix décroissant</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleReset}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    Réinitialiser les filtres
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
