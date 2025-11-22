"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckoutStepsProps {
    currentStep: number;
    steps: string[];
}

export default function CheckoutSteps({ currentStep, steps }: CheckoutStepsProps) {
    return (
        <div className="w-full py-4">
            <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-gray-700 -z-10" />
                <div
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-creasoka -z-10 transition-all duration-500"
                    style={{
                        width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                    }}
                />
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = currentStep > stepNumber;
                    const isCurrent = currentStep === stepNumber;

                    return (
                        <div key={step} className="flex flex-col items-center">
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 bg-background",
                                    isCompleted
                                        ? "bg-creasoka border-creasoka text-white"
                                        : isCurrent
                                            ? "border-creasoka text-creasoka"
                                            : "border-gray-300 text-gray-400 dark:border-gray-600"
                                )}
                            >
                                {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
                            </div>
                            <span
                                className={cn(
                                    "text-xs mt-2 font-medium transition-colors duration-300 absolute top-8 w-24 text-center",
                                    isCurrent ? "text-creasoka" : "text-gray-500 dark:text-gray-400"
                                )}
                            >
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
