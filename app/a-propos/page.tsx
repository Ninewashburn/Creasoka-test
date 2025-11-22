"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Sparkles, Palette } from "lucide-react";

export default function AboutPage() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
            },
        },
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/80 to-pink-500/80 z-10" />
                <Image
                    src="/placeholder.svg"
                    alt="Atelier de création"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="relative z-20 container mx-auto px-4 text-center text-white">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl md:text-6xl font-bold mb-6"
                    >
                        L&apos;Histoire de Crea&apos;Soka
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl md:text-2xl max-w-2xl mx-auto font-light"
                    >
                        Où la passion rencontre l&apos;artisanat pour créer de la magie
                    </motion.p>
                </div>
            </section>

            {/* Main Content */}
            <motion.div
                className="container mx-auto px-4 py-16 md:py-24"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
            >
                {/* Story Section */}
                <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
                    <motion.div variants={itemVariants}>
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-creasoka">
                            Qui se cache derrière Crea&apos;Soka ?
                        </h2>
                        <div className="space-y-4 text-lg text-gray-600 dark:text-gray-300">
                            <p>
                                Bonjour ! Je suis la créatrice passionnée derrière chaque pièce que
                                vous voyez ici. Depuis toujours, j&apos;ai été fascinée par l&apos;art de
                                transformer des matériaux simples en objets porteurs d&apos;émotion.
                            </p>
                            <p>
                                Crea&apos;Soka est née de cette envie de partager mon univers : un
                                mélange de pop-culture, de douceur et de fantaisie. Chaque création
                                est une petite partie de mon imagination qui prend vie entre mes
                                mains.
                            </p>
                            <p>
                                Mon objectif ? Apporter une touche de magie et de sourire dans
                                votre quotidien à travers des objets uniques, faits avec amour et
                                patience.
                            </p>
                        </div>
                    </motion.div>
                    <motion.div
                        variants={itemVariants}
                        className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl rotate-3 hover:rotate-0 transition-transform duration-500"
                    >
                        <Image
                            src="/placeholder.svg"
                            alt="Portrait de la créatrice"
                            fill
                            className="object-cover"
                        />
                    </motion.div>
                </div>

                {/* Values Section */}
                <motion.div variants={itemVariants} className="mb-24">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                        Mes Valeurs
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Heart,
                                title: "Fait avec Amour",
                                description:
                                    "Chaque pièce est unique et réalisée à la main avec une attention particulière aux détails.",
                            },
                            {
                                icon: Sparkles,
                                title: "Créativité",
                                description:
                                    "Des designs originaux inspirés par la pop-culture, la nature et l'imaginaire.",
                            },
                            {
                                icon: Palette,
                                title: "Qualité",
                                description:
                                    "Utilisation de matériaux durables comme la résine époxy et l'acier inoxydable.",
                            },
                        ].map((value, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ y: -10 }}
                                className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center border border-gray-100 dark:border-gray-700"
                            >
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 text-creasoka mb-6">
                                    <value.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {value.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Process Section */}
                <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
                    <motion.div
                        variants={itemVariants}
                        className="order-2 md:order-1 relative h-[400px] rounded-2xl overflow-hidden shadow-xl -rotate-3 hover:rotate-0 transition-transform duration-500"
                    >
                        <Image
                            src="/placeholder.svg"
                            alt="Processus de création"
                            fill
                            className="object-cover"
                        />
                    </motion.div>
                    <motion.div variants={itemVariants} className="order-1 md:order-2">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-creasoka">
                            Le Processus de Création
                        </h2>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-500 font-bold text-xl">
                                    1
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">L&apos;Inspiration</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Tout commence par une idée, un croquis ou une envie de donner
                                        vie à un personnage adoré.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-500 font-bold text-xl">
                                    2
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">La Fabrication</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Moulage, coulée de résine, ponçage... C&apos;est l&apos;étape la plus
                                        longue qui demande patience et précision.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 font-bold text-xl">
                                    3
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Les Finitions</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Peinture à la main, vernis et assemblage final pour garantir
                                        un résultat parfait et durable.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* CTA Section */}
                <motion.div
                    variants={itemVariants}
                    className="text-center bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-12 text-white shadow-2xl"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Envie de découvrir mes créations ?
                    </h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                        Parcourez la galerie pour voir le résultat de ce travail passionné ou
                        contactez-moi pour une commande personnalisée.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            asChild
                            size="lg"
                            variant="secondary"
                            className="bg-white text-purple-600 hover:bg-gray-100"
                        >
                            <Link href="/galerie">
                                Voir la Galerie <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="bg-transparent border-white text-white hover:bg-white/20 hover:text-white"
                        >
                            <Link href="/contact">Me Contacter</Link>
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
