'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Trash2, Plus, Save, Copy, RotateCcw, Lock, LogOut } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { saveSession, getValidSession, clearSession } from '@/services/auth'

interface Ingredient {
  id: string
  name: string
  quantity: number
  packagePrice: number
  packageWeight: number
  cost: number
}

interface Extra {
  id: string
  item: string
  quantity: number
  unitPrice: number
  cost: number
}

interface CoverageIngredient {
  id: string
  name: string
  quantity: number
  packagePrice: number
  packageWeight: number
  cost: number
}

interface Recipe {
  id: string
  name: string
  baseWeight: number
  ingredients: Omit<Ingredient, 'id' | 'cost'>[]
}

interface Coverage {
  id: string
  name: string
  suggestedQuantity: number
  packageWeight: number
  ingredients?: { name: string; quantity: number }[]
}

// Dados JSON das receitas e coberturas
const recipesData = {
  "bolos": [
    {
      "titulo": "Bolo Baunilha",
      "forma": "Fôrma furo no meio 20cm",
      "tempo_total": "1h20min",
      "versoes": [
        {
          "tipo": "Versão Premium",
          "ingredientes": [
            "195g de farinha de trigo",
            "15g de amido de milho",
            "220g de açúcar refinado",
            "100g de ovos (cerca de 2)",
            "75g de manteiga sem sal (ponto pomada)",
            "65g de óleo vegetal sem sabor (girassol ou milho)",
            "115g de iogurte natural integral",
            "100g de leite integral",
            "10g de extrato ou essência de baunilha",
            "7g de fermento químico",
            "3g de bicarbonato de sódio",
            "3g de vinagre branco ou suco de limão",
            "2g de sal"
          ]
        },
        {
          "tipo": "Versão Express (Óleo)",
          "ingredientes": [
            "195g de farinha de trigo",
            "15g de amido de milho",
            "220g de açúcar refinado",
            "100g de ovos (cerca de 2 ovos)",
            "125g de óleo vegetal sem sabor (girassol ou milho)",
            "225g de buttermilk (211g de leite integral + 14g de vinagre branco ou suco de limão)",
            "10g de extrato ou essência de baunilha",
            "10g de fermento químico",
            "2g de sal"
          ]
        }
      ]
    },
    {
      "titulo": "Bolo Mesclado",
      "forma": "Fôrma furo no meio 20cm",
      "tempo_total": "1h20min",
      "versoes": [
        {
          "tipo": "Versão Premium",
          "ingredientes": [
            "195g de farinha de trigo",
            "15g de amido de milho",
            "220g de açúcar refinado",
            "100g de ovos (cerca de 2)",
            "75g de manteiga sem sal (ponto pomada)",
            "65g de óleo vegetal sem sabor (girassol ou milho)",
            "115g de iogurte natural integral",
            "100g de leite integral",
            "10g de extrato ou essência de baunilha",
            "7g de fermento químico",
            "3g de bicarbonato de sódio",
            "3g de vinagre branco ou suco de limão",
            "2g de sal"
          ]
        },
        {
          "tipo": "Versão Express (Óleo)",
          "ingredientes": [
            "195g de farinha de trigo",
            "15g de amido de milho",
            "220g de açúcar refinado",
            "100g de ovos (cerca de 2 ovos)",
            "125g de óleo vegetal sem sabor (girassol ou milho)",
            "225g de buttermilk (211g de leite integral + 14g de vinagre branco ou suco de limão)",
            "10g de extrato ou essência de baunilha",
            "10g de fermento químico",
            "2g de sal"
          ]
        }
      ]
    },
    {
      "titulo": "Bolo Chocolate",
      "forma": "Fôrma furo no meio 20cm",
      "tempo_total": "1h20min",
      "versoes": [
        {
          "tipo": "Versão Premium",
          "ingredientes": [
            "180g de farinha de trigo",
            "15g de amido de milho",
            "30g de cacau em pó 100% (peneirado)",
            "235g de açúcar refinado (ou 175g de açúcar refinado + 60g de açúcar mascavo)",
            "135g de ovos (cerca de 2 ovos e meio, misturados)",
            "80g de manteiga sem sal",
            "35g de óleo vegetal sem sabor (girassol ou milho)",
            "130g de iogurte natural integral",
            "100g de água quente (adicione ao fim do preparo)",
            "8g de extrato ou essência de baunilha",
            "7g de fermento químico",
            "3g de bicarbonato de sódio",
            "3g de vinagre branco ou suco de limão (adicione aos líquidos)",
            "2g de sal"
          ]
        },
        {
          "tipo": "Versão Express (Óleo)",
          "ingredientes": [
            "180g de farinha de trigo",
            "15g de amido de milho",
            "30g de cacau em pó 100% (peneirado)",
            "235g de açúcar refinado (ou 175g de açúcar refinado + 60g de açúcar mascavo)",
            "135g de ovos (cerca de 2 ovos e meio, misturados)",
            "105g de óleo vegetal sem sabor (girassol ou milho)",
            "140g de buttermilk (131g de leite integral + 9g de vinagre ou suco de limão)",
            "100g de água quente (adicione ao fim do preparo)",
            "8g de extrato ou essência de baunilha",
            "2g de sal",
            "10g de fermento químico (ou 7g de fermento + 3g de bicarbonato + 3g de vinagre)"
          ]
        }
      ]
    },
    {
      "titulo": "Bolo Chocolate Intenso",
      "forma": "Fôrma furo no meio 20cm",
      "tempo_total": "1h20min",
      "ingredientes": [
        "165g de farinha de trigo",
        "60g de cacau em pó 100% peneirado",
        "165g de açúcar refinado",
        "90g de açúcar mascavo (ou 255g apenas de açúcar refinado)",
        "100g de ovos (aproximadamente 2 ovos médios)",
        "75g de óleo vegetal sem sabor (como girassol ou milho)",
        "165g de buttermilk (ou 150g de leite + 15g de vinagre ou suco de limão)",
        "110g de café quente",
        "2g de essência ou extrato de baunilha",
        "7g de fermento químico",
        "3g de bicarbonato de sódio",
        "3g de sal"
      ]
    },
    {
      "titulo": "Bolo Red Velvet",
      "forma": "Fôrma furo no meio 20cm",
      "tempo_total": "1h20min",
      "versoes": [
        {
          "tipo": "Versão Premium",
          "ingredientes": [
            "185g de farinha de trigo",
            "15g de amido de milho",
            "10g de cacau em pó 100%",
            "220g de açúcar refinado",
            "100g de ovos (cerca de 2)",
            "75g de manteiga sem sal (ponto pomada)",
            "65g de óleo vegetal sem sabor (girassol ou milho)",
            "115g de iogurte natural integral",
            "100g de leite integral",
            "10g de extrato ou essência de baunilha",
            "7g de fermento químico",
            "3g de bicarbonato de sódio",
            "3g de vinagre branco ou suco de limão",
            "2g de sal",
            "5g a 10g de corante em gel vermelho de boa qualidade"
          ]
        },
        {
          "tipo": "Versão Express (Óleo)",
          "ingredientes": [
            "185g de farinha de trigo",
            "15g de amido de milho",
            "10g de cacau em pó",
            "220g de açúcar refinado",
            "100g de ovos (cerca de 2 ovos)",
            "125g de óleo vegetal sem sabor (girassol ou milho)",
            "225g de buttermilk (211g de leite integral + 14g de vinagre branco ou suco de limão)",
            "10g de extrato ou essência de baunilha",
            "10g de fermento químico",
            "2g de sal",
            "5g a 10g de corante em gel vermelho de boa qualidade"
          ]
        }
      ]
    },
    {
      "titulo": "Bolo de Cenoura",
      "forma": "Fôrma furo no meio 20cm",
      "tempo_total": "1h20min",
      "ingredientes": [
        "160g de farinha de trigo",
        "38g de amido de milho",
        "195g de açúcar refinado",
        "130g de ovos (cerca de 2 ovos e meio — gema e clara misturados e pesados)",
        "172g de cenoura crua (descascada e picada)",
        "96g de óleo vegetal sem sabor (girassol, milho ou canola)",
        "96g de leite integral",
        "8g de extrato ou essência de baunilha (opcional)",
        "10g de fermento químico em pó",
        "2g de sal"
      ]
    },
    {
      "titulo": "Bolo de Churros",
      "forma": "Fôrma furo no meio 20cm",
      "tempo_total": "1h20min",
      "ingredientes": [
        "220g de farinha de trigo",
        "15g de amido de milho",
        "170g de açúcar refinado",
        "130g de ovos",
        "110g de óleo vegetal sem sabor (girassol ou milho)",
        "60g de iogurte natural integral",
        "100g de leite integral",
        "80g de doce de leite cremoso (ou leite condensado cozido na pressão)",
        "8g de extrato ou essência de baunilha (opcional)",
        "8g de canela",
        "7g de fermento químico",
        "3g de bicarbonato de sódio",
        "3g de vinagre branco ou suco de limão",
        "2g de sal"
      ]
    },
    {
      "titulo": "Bolo de Paçoca",
      "forma": "Fôrma furo no meio 20cm",
      "tempo_total": "1h20min",
      "versoes": [
        {
          "tipo": "Versão Premium",
          "ingredientes": [
            "195g de farinha de trigo",
            "15g de amido de milho",
            "220g de açúcar refinado",
            "100g de ovos (cerca de 2)",
            "75g de manteiga sem sal (ponto pomada)",
            "65g de óleo vegetal sem sabor (girassol ou milho)",
            "115g de iogurte natural integral",
            "100g de leite integral",
            "10g de extrato ou essência de baunilha",
            "80g de paçoca",
            "7g de fermento químico",
            "3g de bicarbonato de sódio",
            "3g de vinagre branco ou suco de limão",
            "2g de sal"
          ]
        },
        {
          "tipo": "Versão Express (Óleo)",
          "ingredientes": [
            "195g de farinha de trigo",
            "15g de amido de milho",
            "220g de açúcar refinado",
            "100g de ovos (cerca de 2 ovos)",
            "125g de óleo vegetal sem sabor (girassol ou milho)",
            "225g de buttermilk (211g de leite integral + 14g de vinagre branco ou suco de limão)",
            "10g de extrato ou essência de baunilha",
            "80g de paçoca",
            "10g de fermento químico",
            "2g de sal"
          ]
        }
      ]
    },
    {
      "titulo": "Bolo de Côco Com Chocolate Branco",
      "forma": "Fôrma furo no meio 20cm",
      "tempo_total": "1h20min",
      "versoes": [
        {
          "tipo": "Versão Premium",
          "ingredientes": [
            "195g de farinha de trigo",
            "15g de amido de milho",
            "220g de açúcar refinado",
            "100g de ovos (cerca de 2)",
            "75g de manteiga sem sal (ponto pomada)",
            "55g de óleo vegetal sem sabor (girassol ou milho)",
            "115g de iogurte natural integral",
            "100g de leite de côco",
            "10g de extrato ou essência de baunilha",
            "7g de fermento químico",
            "3g de bicarbonato de sódio",
            "3g de vinagre branco ou suco de limão",
            "2g de sal",
            "90g de gotas de chocolate branco"
          ]
        },
        {
          "tipo": "Versão Express (Óleo)",
          "ingredientes": [
            "195g de farinha de trigo",
            "15g de amido de milho",
            "220g de açúcar refinado",
            "100g de ovos (cerca de 2)",
            "115g de óleo vegetal sem sabor (girassol ou milho)",
            "117g de leite integral + 8g de vinagre branco ou suco de limão (para formar o buttermilk)",
            "100g de leite de coco",
            "8g de extrato ou essência de baunilha",
            "10g de fermento químico",
            "2g de sal"
          ]
        }
      ]
    },
    {
      "titulo": "Bolo de Tapioca",
      "forma": "Fôrma furo no meio 20cm",
      "tempo_total": "1h20min",
      "ingredientes": [
        "150g de farinha de trigo",
        "12g de amido de milho",
        "200g de açúcar",
        "120g de ovos (cerca de 2 ovos e meio inteiros)",
        "95g de manteiga sem sal derretida",
        "40g de óleo vegetal sem sabor (girassol ou canola)",
        "110g de leite de coco",
        "55g de buttermilk (52g de leite integral + 3g de vinagre branco)",
        "30g de coco ralado",
        "85g de tapioca granulada para bolo",
        "7g de fermento químico",
        "3g de bicarbonato de sódio",
        "2g de sal"
      ]
    },
    {
      "titulo": "Bolo de Fubá",
      "forma": "Fôrma furo no meio 20cm",
      "tempo_total": "1h20min",
      "versoes": [
        {
          "tipo": "Versão Premium",
          "ingredientes": [
            "90g farinha de trigo",
            "90g fubá mimoso (bem fino)",
            "215g açúcar refinado",
            "150g ovos (cerca de 3 ovos inteiros médios)",
            "60g manteiga sem sal derretida",
            "50g óleo vegetal sem sabor (girassol, milho ou canola)",
            "90g leite integral",
            "60g leite de coco",
            "10g fermento químico",
            "2g sal",
            "8g extrato ou essência de baunilha (opcional)",
            "2g erva-doce (opcional)"
          ]
        },
        {
          "tipo": "Versão Express (Óleo)",
          "ingredientes": [
            "90g farinha de trigo",
            "90g fubá mimoso (bem fino)",
            "215g açúcar refinado",
            "150g ovos (cerca de 3 ovos inteiros médios)",
            "100g óleo vegetal sem sabor (girassol, milho ou canola)",
            "100g leite integral",
            "60g leite de côco (ou mais 60g de leite integral - total 160g)",
            "8g fermento químico",
            "2g sal",
            "8g extrato ou essência de baunilha (opcional)"
          ]
        }
      ]
    },
    {
      "titulo": "Bolo de Milho",
      "forma": "Fôrma furo no meio 20cm",
      "tempo_total": "1h20min",
      "ingredientes": [
        "120g de fubá mimoso",
        "35g de farinha de trigo",
        "35g de coco ralado sem açúcar (opcional, mas recomendado)",
        "155g de açúcar refinado ou cristal",
        "115g de ovos (cerca de 2 ovos e meio)",
        "75g de óleo vegetal sem sabor (girassol ou milho)",
        "190g de milho verde cozido (ou milho de lata escorrido)",
        "155g de leite de coco",
        "10g de extrato ou essência de baunilha (opcional)",
        "10g de fermento químico em pó",
        "2g de sal"
      ]
    },
    {
      "titulo": "Bolo de Aipim",
      "forma": "Fôrma furo no meio 20cm",
      "tempo_total": "1h20min",
      "ingredientes": [
        "342g de aipim cru ralado fino ou processado",
        "70g de coco ralado sem açúcar",
        "205g de açúcar refinado",
        "70g de ovos",
        "25g de manteiga sem sal derretida",
        "115g de leite de coco",
        "90g de leite integral",
        "2g de sal"
      ],
      "observacao": "Essa receita não vai fermento"
    },
    {
      "titulo": "Bolo de Laranja",
      "forma": "Fôrma furo no meio 20cm",
      "tempo_total": "1h20min",
      "versoes": [
        {
          "tipo": "Versão Premium",
          "ingredientes": [
            "195g de farinha de trigo",
            "15g de amido de milho",
            "220g de açúcar refinado (ou cristal)",
            "100g de ovos (cerca de 2)",
            "75g de manteiga sem sal (ponto pomada)",
            "65g de óleo vegetal sem sabor (girassol ou milho)",
            "115g de iogurte natural integral",
            "100g de suco de laranja integral (preferencialmente bahia, coado)",
            "8g de extrato ou essência de baunilha",
            "7g de fermento químico",
            "3g de bicarbonato de sódio",
            "3g de vinagre branco ou suco de limão",
            "2g de sal",
            "Raspas de 1 laranja retiradas na hora (evite a parte branca)"
          ]
        },
        {
          "tipo": "Versão Express (Óleo)",
          "ingredientes": [
            "195g de farinha de trigo",
            "15g de amido de milho",
            "220g de açúcar refinado",
            "100g de ovos (cerca de 2 ovos)",
            "125g de óleo vegetal sem sabor (girassol ou milho)",
            "117g de leite integral + 8g de vinagre branco ou suco de limão (para formar o buttermilk)",
            "100g de suco de laranja integral (preferencialmente bahia, coado)",
            "8g de extrato ou essência de baunilha",
            "10g de fermento químico",
            "2g de sal",
            "Raspas de 1 laranja retiradas na hora (evite a parte branca)"
          ]
        }
      ]
    },
    {
      "titulo": "Bolo de Limão",
      "forma": "Fôrma furo no meio 20cm",
      "tempo_total": "1h20min",
      "versoes": [
        {
          "tipo": "Versão Premium",
          "ingredientes": [
            "195g de farinha de trigo",
            "15g de amido de milho",
            "220g de açúcar refinado (ou cristal)",
            "100g de ovos (cerca de 2)",
            "75g de manteiga sem sal (ponto pomada)",
            "65g de óleo vegetal sem sabor (girassol ou milho)",
            "115g de iogurte natural integral",
            "100g de leite integral",
            "10g de extrato ou essência de baunilha",
            "7g de fermento químico",
            "3g de bicarbonato de sódio",
            "3g de vinagre branco ou suco de limão",
            "2g de sal",
            "Raspas de 2 a 3 limões retiradas na hora (tahiti ou siciliano)"
          ]
        },
        {
          "tipo": "Versão Express (Óleo)",
          "ingredientes": [
            "195g de farinha de trigo",
            "15g de amido de milho",
            "220g de açúcar refinado",
            "100g de ovos (cerca de 2 ovos)",
            "125g de óleo vegetal sem sabor (girassol ou milho)",
            "225g de buttermilk (211g de leite integral + 14g de vinagre branco ou suco de limão)",
            "10g de extrato ou essência de baunilha",
            "10g de fermento químico",
            "2g de sal",
            "Raspas de 2 a 3 limões retiradas na hora (tahiti ou siciliano)"
          ]
        }
      ]
    },
    {
      "titulo": "Bolo Cuca de Banana",
      "forma": "Fôrma furo no meio 20cm",
      "tempo_total": "1h20min",
      "massa": [
        "195g de farinha de trigo",
        "15g de amido de milho",
        "220g de açúcar refinado (ou cristal)",
        "100g de ovos (cerca de 2)",
        "75g de manteiga sem sal (ponto pomada)",
        "65g de óleo vegetal sem sabor (girassol ou milho)",
        "115g de iogurte natural integral",
        "100g de leite integral",
        "10g de extrato ou essência de baunilha",
        "10g de canela (opcional)",
        "7g de fermento químico",
        "3g de bicarbonato de sódio",
        "3g de vinagre branco ou suco de limão",
        "2g de sal"
      ],
      "farofa_crocante": [
        "60g de farinha de trigo",
        "75g de açúcar refinado",
        "8g de canela em pó",
        "30g de manteiga gelada em cubos",
        "3 bananas maduras (nanica ou prata), cortadas em rodelas",
        "Goiabada OU doce de leite a gosto (em pedaços pequenos ou porções generosas com colher)"
      ]
    },
    {
      "titulo": "Bolo de Maçã",
      "forma": "Fôrma furo no meio 20cm",
      "tempo_total": "1h20min",
      "ingredientes": [
        "185g de farinha de trigo",
        "20g de amido de milho",
        "150g de açúcar refinado",
        "60g de açúcar mascavo (ou pode utilizar total de 210g apenas do açúcar refinado)",
        "100g de ovos (cerca de 2)",
        "140g de óleo vegetal sem sabor (girassol ou milho)",
        "40g de leite integral",
        "180g de maçã ralada (bem fininha)",
        "10g de extrato ou essência de baunilha",
        "4g de canela (opcional)",
        "3g de gengibre (opcional)",
        "1g de noz-moscada (opcional)",
        "7g de fermento químico",
        "3g de bicarbonato de sódio",
        "2g de sal",
        "80g de nozes tostadas e picadas ou mix de castanhas da sua preferência (opcional)"
      ]
    },
    {
      "titulo": "Bolo de Manteiga Noisette (Dourada)",
      "forma": "Fôrma furo no meio 20cm",
      "tempo_total": "1h20min",
      "ingredientes": [
        "195g de farinha de trigo",
        "15g de amido de milho",
        "220g de açúcar refinado",
        "135g de ovos (cerca de 2 ovos)",
        "75g de manteiga noisette (já torrada e pesada depois do processo)",
        "1 colher de sopa rasa (cerca de 5g) de leite em pó (opcional, para acentuar o sabor tostado)",
        "65g de óleo vegetal sem sabor (girassol ou milho)",
        "115g de iogurte natural integral (ou buttermilk)",
        "100g de leite integral",
        "10g de extrato ou essência de baunilha",
        "7g de fermento químico",
        "3g de bicarbonato de sódio",
        "3g de vinagre branco ou suco de limão",
        "2g de sal"
      ],
      "observacao": "Separe cerca de 92g a 95g de manteiga sem sal para torrar, pois ela perde peso nesse processo"
    },
    {
      "titulo": "Bolo de Café Vanilla Latte",
      "forma": "Fôrma furo no meio 20cm",
      "tempo_total": "1h20min",
      "versoes": [
        {
          "tipo": "Versão Premium",
          "ingredientes": [
            "195g de farinha de trigo",
            "15g de amido de milho",
            "220g de açúcar refinado (ou cristal)",
            "100g de ovos (cerca de 2)",
            "75g de manteiga sem sal (ponto pomada)",
            "65g de óleo vegetal sem sabor (girassol ou milho)",
            "115g de iogurte natural integral",
            "100g de leite integral",
            "10g de extrato ou essência de baunilha",
            "6g de café solúvel (ou a gosto, não é pra ser intenso)",
            "7g de fermento químico",
            "3g de bicarbonato de sódio",
            "3g de vinagre branco ou suco de limão",
            "2g de sal"
          ]
        },
        {
          "tipo": "Versão Express (Óleo)",
          "ingredientes": [
            "195g de farinha de trigo",
            "15g de amido de milho",
            "220g de açúcar refinado",
            "100g de ovos (cerca de 2 ovos)",
            "125g de óleo vegetal sem sabor (girassol ou milho)",
            "225g de buttermilk (211g de leite integral + 14g de vinagre branco ou suco de limão)",
            "10g de extrato ou essência de baunilha",
            "6g de café solúvel (ou a gosto, não é pra ser intenso)",
            "10g de fermento químico",
            "2g de sal"
          ]
        }
      ]
    },
    {
      "titulo": "Bolo de Banana Com Manteiga Noisette",
      "forma": "Fôrma furo no meio 20cm",
      "tempo_total": "1h20min",
      "ingredientes": [
        "200g de farinha de trigo",
        "10g de amido de milho",
        "130g de açúcar branco",
        "50g de açúcar mascavo",
        "110g de ovos",
        "240g de banana madura amassada",
        "80g de manteiga sem sal (derretida/tostada)",
        "30g óleo sem sabor",
        "50g de iogurte integral sem sabor",
        "60g de buttermilk (56g de leite + 4g de vinagre branco)",
        "8g de fermento químico",
        "3g de bicarbonato de sódio",
        "3g de sal",
        "5g de extrato de baunilha",
        "150g de gotas de chocolate (opcional)"
      ],
      "observacao": "Separe cerca de 100g de manteiga crua para tostar e depois pese novamente os 80g após o processo"
    },
    {
      "titulo": "Carrot Cake - Bolo de Cenoura Americano",
      "forma": "Fôrma furo no meio 20cm",
      "tempo_total": "1h20min",
      "ingredientes": [
        "185g de farinha de trigo",
        "15g de amido de milho",
        "130g de açúcar refinado",
        "80g de açúcar mascavo escuro (dark brown sugar)",
        "127g de ovos (cerca de 2 ovos e meio)",
        "100g de óleo vegetal sem sabor (girassol ou canola)",
        "50g de iogurte integral",
        "35g de leite integral (ou buttermilk)",
        "42g de abacaxi batido (natural, sem açúcar)",
        "125g de cenoura ralada fina",
        "8g de extrato ou essência de baunilha",
        "3g de canela em pó",
        "2g de gengibre em pó",
        "1g de noz-moscada ralada",
        "7g de fermento químico",
        "3g de bicarbonato de sódio",
        "2g de sal",
        "80g de nozes tostadas e picadas (opcional)"
      ]
    }
  ]
}

const coveragesData = {
  "coberturas": [
    {
      "titulo": "Brigadeiro Tradicional",
      "rendimento": "650g",
      "ingredientes": [
        "395g de leite condensado (integral ou semidesnatado com no mínimo 6% de gordura)",
        "400g de creme de leite (mínimo 17% de gordura – UHT ou fresco)",
        "80g de chocolate ao leite nobre (ou 50g de chocolate meio amargo)",
        "20g de cacau 100% peneirado"
      ]
    },
    {
      "titulo": "Brigadeiro Premium",
      "rendimento": "650g",
      "ingredientes": [
        "395g de leite condensado",
        "400g de creme de leite",
        "150g de chocolate nobre"
      ]
    },
    {
      "titulo": "Brigadeiro de Cacau",
      "rendimento": "600g",
      "ingredientes": [
        "395g de leite condensado (integral ou semidesnatado com no mínimo 6% de gordura)",
        "400g de creme de leite (mínimo 17% de gordura – UHT ou fresco)",
        "30g de cacau 100% peneirado",
        "20g de manteiga (opcional para mais cremosidad)"
      ]
    },
    {
      "titulo": "Brigadeiro de Nutella",
      "rendimento": "750g",
      "ingredientes": [
        "395g de leite condensado integral (ou semidesnatado com pelo menos 6% de gordura)",
        "400g de creme de leite (mínimo 17% de gordura)",
        "150g de Nutella"
      ]
    },
    {
      "titulo": "Brigadeiro Branco",
      "rendimento": "690g",
      "ingredientes": [
        "395g de leite condensado (integral ou semidesnatado com no mínimo 6% de gordura)",
        "400g de creme de leite (mínimo 17% de gordura – UHT ou fresco)",
        "100g de chocolate branco nobre (opcional para mais cremosidade)"
      ]
    },
    {
      "titulo": "Brigadeiro de Leite em Pó (Ninho)",
      "rendimento": "690g",
      "ingredientes": [
        "395g de leite condensado integral (ou semidesnatado com pelo menos 6% de gordura)",
        "400g de creme de leite (mínimo 17% de gordura)",
        "50g de leite em pó integral instantâneo",
        "50g de chocolate branco (opcional, adicionado no final)"
      ]
    },
    {
      "titulo": "Brigadeiro 4 Leites",
      "rendimento": "690g",
      "ingredientes": [
        "395g de leite condensado integral (ou semidesnatado com pelo menos 6% de gordura)",
        "300g de creme de leite (mínimo 17% de gordura)",
        "100g de leite de coco",
        "50g de leite em pó integral instantâneo",
        "50g de chocolate branco (opcional, adicionado no final)"
      ]
    },
    {
      "titulo": "Brigadeiro de Capuccino",
      "rendimento": "680g",
      "ingredientes": [
        "395g de leite condensado (ou semidesnatado com pelo menos 6% de gordura)",
        "400g de creme de leite (mínimo 17% de gordura)",
        "10g de café solúvel",
        "40g de chocolate ao leite (picado ou em gotas de boa qualidade)",
        "40g de leite em pó (integral instantâneo)"
      ]
    },
    {
      "titulo": "Brigadeiro de Coco / Beijinho",
      "rendimento": "710g",
      "ingredientes": [
        "395g de leite condensado integral (ou semidesnatado com pelo menos 6% de gordura)",
        "200g de creme de leite (mínimo 17% de gordura)",
        "200g de leite de coco",
        "70g de coco ralado",
        "50g de chocolate branco (opcional, adicionado no final)"
      ]
    },
    {
      "titulo": "Brigadeiro de Doce de Leite Suave",
      "rendimento": "590g",
      "ingredientes": [
        "395g de leite condensado cozido na pressão por 40 minutos (ou doce de leite pronto, cremoso e de boa qualidade)",
        "400g de creme de leite com no mínimo 17% de gordura"
      ]
    },
    {
      "titulo": "Brigadeiro de Paçoca",
      "rendimento": "690g",
      "ingredientes": [
        "395g de leite condensado integral (ou semidesnatado com pelo menos 6% de gordura)",
        "400g de creme de leite (mínimo 17% de gordura)",
        "100g ou 6 paçocas tipo rolha (a gosto)"
      ]
    },
    {
      "titulo": "Brigadeiro de Milho",
      "rendimento": "680g",
      "ingredientes": [
        "395g de leite condensado integral (ou semidesnatado com pelo menos 6% de gordura)",
        "200g de creme de leite (mín. 17% de gordura)",
        "50g de leite de coco",
        "100g de milho verde cozido (escorrido)",
        "50g de chocolate branco (picado ou em gotas)"
      ]
    },
    {
      "titulo": "Brigadeiro Cítrico - Laranja ou Limão",
      "rendimento": "730g",
      "ingredientes": [
        "395g de leite condensado (integral ou com mínimo de 6% de gordura)",
        "400g de creme de leite (mínimo 17% de gordura)",
        "100g de chocolate branco (de boa qualidade)",
        "50g de suco de laranja Bahia ou limão siciliano (fresco e coado)",
        "Raspas finas da casca de 1 laranja ou 1 limão siciliano retiradas na hora"
      ]
    },
    {
      "titulo": "Brigadeiro de Cream Cheese",
      "rendimento": "680g",
      "ingredientes": [
        "395g de leite condensado integral (ou semidesnatado com pelo menos 6% de gordura)",
        "400g de creme de leite (mínimo 17% de gordura)",
        "150g de cream cheese",
        "50g de chocolate branco nobre (opcional)"
      ]
    },
    {
      "titulo": "Cream Cheese Frosting",
      "rendimento": "600g",
      "ingredientes": [
        "150g de manteiga sem sal (em ponto pomada)",
        "200g de açúcar de confeiteiro (ou impalpável)",
        "250g de cream cheese",
        "10g de extrato, pasta ou essência de baunilha"
      ]
    },
    {
      "titulo": "Calda de Cítricos - Glacê de Limão ou Laranja",
      "rendimento": "400g",
      "ingredientes": [
        "300g de açúcar de confeiteiro",
        "65g de água filtrada",
        "35g de suco de laranja ou suco de limão espremido na hora (coado)"
      ]
    },
    {
      "titulo": "Calda de Goiabada",
      "rendimento": "330g",
      "ingredientes": [
        "360g de goiabada (em barra ou cremosa)",
        "120g de água filtrada"
      ]
    },
    {
      "titulo": "Caramelo Salgado",
      "rendimento": "330g",
      "ingredientes": [
        "120g de açúcar refinado",
        "110g de creme de leite (preferência fresco ou UHT 25%) ou o máximo possível de gordura para uma textura menos granulosa",
        "110g de chocolate branco",
        "35g de manteiga sem sal",
        "1 boa pitada de flor de sal ou sal refinado"
      ]
    },
    {
      "titulo": "Geleia de Frutas",
      "rendimento": "330g",
      "ingredientes": [
        "1000g de frutas frescas ou congeladas",
        "40g de suco de limão taiti",
        "250g de açúcar cristal"
      ]
    },
    {
      "titulo": "Ganaches Fluidas",
      "rendimento": "400 a 450g",
      "versoes": [
        {
          "tipo": "Chocolate meio amargo ou amargo",
          "ingredientes": [
            "200g de chocolate + 260g de creme de leite"
          ]
        },
        {
          "tipo": "Chocolate ao leite",
          "ingredientes": [
            "200g de chocolate + 200g de creme de leite"
          ]
        },
        {
          "tipo": "Chocolate branco",
          "ingredientes": [
            "200g de chocolate + 250g de creme de leite"
          ]
        }
      ],
      "opcional": "Para um brilho extra, adicione cerca de 15g de glucose para cada 200g de chocolate"
    }
  ]
}

// Função para processar ingredientes e detectar buttermilk
const processIngredient = (ingredientStr: string): Array<{quantity: number, name: string}> => {
  // Verifica se é buttermilk com parênteses
  const buttermilkMatch = ingredientStr.match(/^(\d+(?:\.\d+)?)g\s+de\s+buttermilk\s*\(([^)]+)\)$/i)
  if (buttermilkMatch) {
    const ingredients = []
    const components = buttermilkMatch[2]
    
    // Processa os componentes dentro dos parênteses
    // Divide por "+" e processa cada componente
    const componentParts = components.split('+')
    componentParts.forEach(part => {
      const compMatch = part.trim().match(/(\d+(?:\.\d+)?)g\s+de\s+(.+)/i)
      if (compMatch) {
        ingredients.push({
          quantity: parseFloat(compMatch[1]),
          name: compMatch[2].trim()
        })
      }
    })
    return ingredients
  }
  
  // Para ingredientes normais, retorna array com um único item
  const parsed = parseIngredient(ingredientStr)
  return [parsed]
}

// Função para parsear ingredientes do formato "Xg de nome"
const parseIngredient = (ingredientStr: string): { name: string; quantity: number } => {
  const match = ingredientStr.match(/^(\d+(?:\.\d+)?)g\s+(?:de\s+)?(.+)$/i)
  if (match) {
    return {
      quantity: parseFloat(match[1]),
      name: match[2].replace(/\([^)]*\)/g, '').trim() // Remove texto entre parênteses
    }
  }
  // Tenta outros formatos
  const altMatch = ingredientStr.match(/^(\d+(?:\.\d+)?)\s+(.+)$/i)
  if (altMatch) {
    return {
      quantity: parseFloat(altMatch[1]),
      name: altMatch[2].replace(/\([^)]*\)/g, '').trim()
    }
  }
  return { name: ingredientStr, quantity: 0 }
}

// Função para obter peso padrão da embalagem baseado no ingrediente
const getDefaultPackageWeight = (ingredientName: string): number => {
  const name = ingredientName.toLowerCase()
  if (name.includes('farinha') || name.includes('fubá') || name.includes('açúcar') || name.includes('amido')) return 1000
  if (name.includes('ovo')) return 12 // 1 ovo ≈ 12g
  if (name.includes('leite') || name.includes('iogurte') || name.includes('buttermilk')) return 1000
  if (name.includes('manteiga') || name.includes('óleo')) return 500
  if (name.includes('cacau') || name.includes('chocolate')) return 250
  if (name.includes('fermento') || name.includes('bicarbonato') || name.includes('sal')) return 100
  if (name.includes('essência') || name.includes('extrato') || name.includes('corante')) return 50
  if (name.includes('canela') || name.includes('gengibre') || name.includes('noz-moscada')) return 50
  if (name.includes('paçoca')) return 50
  if (name.includes('coco') || name.includes('tapioca')) return 500
  if (name.includes('cenoura') || name.includes('banana') || name.includes('maçã')) return 500
  if (name.includes('milho')) return 200
  if (name.includes('aipim')) return 500
  if (name.includes('abacaxi')) return 500
  if (name.includes('nozes') || name.includes('castanhas')) return 200
  if (name.includes('gotas')) return 200
  return 1000 // padrão
}

// Converter dados JSON para formato da aplicação
const convertRecipes = (): Recipe[] => {
  const recipes: Recipe[] = []
  let id = 1

  recipesData.bolos.forEach(bolo => {
    if (bolo.versoes) {
      // Bolos com múltiplas versões
      bolo.versoes.forEach(versao => {
        const ingredients: Array<{name: string, quantity: number, packagePrice: number, packageWeight: number}> = []
        
        versao.ingredientes.forEach(ingStr => {
          const processedIngredients = processIngredient(ingStr)
          processedIngredients.forEach(parsed => {
            ingredients.push({
              name: parsed.name,
              quantity: parsed.quantity,
              packagePrice: 0, // Usuário vai preencher
              packageWeight: getDefaultPackageWeight(parsed.name)
            })
          })
        })
        
        recipes.push({
          id: (id++).toString(),
          name: `${bolo.titulo} - ${versao.tipo}`,
          baseWeight: 900,
          ingredients
        })
      })
    } else if (bolo.ingredientes) {
      // Bolos com ingredientes diretos
      const ingredients: Array<{name: string, quantity: number, packagePrice: number, packageWeight: number}> = []
      
      bolo.ingredientes.forEach(ingStr => {
        const processedIngredients = processIngredient(ingStr)
        processedIngredients.forEach(parsed => {
          ingredients.push({
            name: parsed.name,
            quantity: parsed.quantity,
            packagePrice: 0,
            packageWeight: getDefaultPackageWeight(parsed.name)
          })
        })
      })
      
      recipes.push({
        id: (id++).toString(),
        name: bolo.titulo,
        baseWeight: 900,
        ingredients
      })
    } else if (bolo.massa) {
      // Bolos com massa + farofa (ex: Cuca de Banana)
      const ingredients: Array<{name: string, quantity: number, packagePrice: number, packageWeight: number}> = []
      
      bolo.massa.forEach(ingStr => {
        const processedIngredients = processIngredient(ingStr)
        processedIngredients.forEach(parsed => {
          ingredients.push({
            name: parsed.name,
            quantity: parsed.quantity,
            packagePrice: 0,
            packageWeight: getDefaultPackageWeight(parsed.name)
          })
        })
      })
      
      recipes.push({
        id: (id++).toString(),
        name: bolo.titulo,
        baseWeight: 900,
        ingredients
      })
    }
  })

  return recipes
}

const convertCoverages = (): Coverage[] => {
  const coverages: Coverage[] = []
  let id = 1

  coveragesData.coberturas.forEach(cobertura => {
    let rendimento = 500 // padrão
    
    if (cobertura.rendimento) {
      const match = cobertura.rendimento.match(/(\d+)/)
      if (match) {
        rendimento = parseInt(match[1])
      }
    }

    // Parse dos ingredientes da cobertura
    let ingredients: { name: string; quantity: number }[] = []
    if (cobertura.ingredientes) {
      ingredients = cobertura.ingredientes.map(ingStr => {
        const parsed = parseIngredient(ingStr)
        return {
          name: parsed.name,
          quantity: parsed.quantity
        }
      })
    } else if (cobertura.versoes) {
      // Para ganaches que têm versões
      const primeiraVersao = cobertura.versoes[0]
      if (primeiraVersao && primeiraVersao.ingredientes) {
        ingredients = primeiraVersao.ingredientes.map(ingStr => {
          const parsed = parseIngredient(ingStr)
          return {
            name: parsed.name,
            quantity: parsed.quantity
          }
        })
      }
    }

    coverages.push({
      id: (id++).toString(),
      name: cobertura.titulo,
      suggestedQuantity: Math.min(rendimento, 400), // Máximo 400g para cobertura
      packageWeight: rendimento,
      ingredients
    })
  })

  return coverages
}

const recipes = convertRecipes()
const coverages = convertCoverages()

export default function CalculadoraExpress() {
  const { toast } = useToast()
  
  // Estados de autenticação
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [accessEmail, setAccessEmail] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  
  // Estados da calculadora
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [quantity, setQuantity] = useState(900)
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [selectedCoverage, setSelectedCoverage] = useState<Coverage | null>(null)
  const [coverageQuantity, setCoverageQuantity] = useState(500)
  const [coverageIngredients, setCoverageIngredients] = useState<CoverageIngredient[]>([])
  const [coveragePrice, setCoveragePrice] = useState(0)
  const [extras, setExtras] = useState<Extra[]>([])
  const [selectedMargin, setSelectedMargin] = useState<'iniciante' | 'pro' | 'premium' | null>(null)
  const [customFinalPrice, setCustomFinalPrice] = useState<number | null>(null)
  const [productName, setProductName] = useState('')

  const margins = {
    iniciante: 2.5,
    pro: 3.0,
    premium: 3.5
  }

  const calculateIngredientCost = (ingredient: Omit<Ingredient, 'id' | 'cost'>): number => {
    if (ingredient.packageWeight === 0) return 0
    
    // Verificar se o ingrediente é ovos
    const isEgg = ingredient.name.toLowerCase().includes('ovo')
    
    if (isEgg) {
      // Para ovos: PesoTotalEmbalagem = QuantidadeEmbalagem × 55
      const pesoTotalEmbalagem = ingredient.packageWeight * 55
      return (ingredient.quantity / pesoTotalEmbalagem) * ingredient.packagePrice
    } else {
      // Para outros ingredientes: cálculo normal
      return (ingredient.packagePrice / ingredient.packageWeight) * ingredient.quantity
    }
  }

  const calculateTotalCost = (): number => {
    const ingredientsCost = ingredients.reduce((sum, ing) => sum + ing.cost, 0)
    const coverageCost = coverageIngredients.reduce((sum, ing) => sum + ing.cost, 0)
    const extrasCost = extras.reduce((sum, extra) => sum + extra.cost, 0)
    return ingredientsCost + coverageCost + extrasCost
  }

  const calculateFinalPrice = (): number => {
    if (customFinalPrice !== null) {
      return customFinalPrice
    }
    if (!selectedMargin) return 0
    return calculateTotalCost() * margins[selectedMargin]
  }

  const calculateDisplayMargin = (): number => {
    if (customFinalPrice !== null) {
      return calculateMarginFromPrice(customFinalPrice)
    }
    if (!selectedMargin) return 0
    return (margins[selectedMargin] - 1) * 100
  }

  const calculateMarginFromPrice = (finalPrice: number): number => {
    const totalCost = calculateTotalCost()
    if (totalCost === 0) return 0
    return ((finalPrice - totalCost) / totalCost) * 100
  }

  const calculateProfitFromPrice = (finalPrice: number): number => {
    return finalPrice - calculateTotalCost()
  }

  const calculateProfit = (): number => {
    if (customFinalPrice !== null) {
      return calculateProfitFromPrice(customFinalPrice)
    }
    return calculateFinalPrice() - calculateTotalCost()
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const parseCurrency = (value: string): number => {
    const cleanValue = value.replace(/[R$\s.]/g, '').replace(',', '.')
    return parseFloat(cleanValue) || 0
  }

  const handleFinalPriceChange = (value: string) => {
    const price = parseCurrency(value)
    setCustomFinalPrice(price)
    // Quando o preço final é alterado, limpa a margem selecionada
    setSelectedMargin(null)
  }

  const handleRecipeChange = (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId)
    if (recipe) {
      setSelectedRecipe(recipe)
      setProductName(recipe.name)
      setQuantity(recipe.baseWeight)
      updateIngredients(recipe.ingredients, recipe.baseWeight)
    }
  }

  const updateIngredients = (baseIngredients: Omit<Ingredient, 'id' | 'cost'>[], targetQuantity: number) => {
    const ratio = targetQuantity / 900
    const updatedIngredients = baseIngredients.map(ing => ({
      ...ing,
      id: Math.random().toString(36).substr(2, 9),
      quantity: Math.round(ing.quantity * ratio),
      cost: calculateIngredientCost({
        ...ing,
        quantity: Math.round(ing.quantity * ratio)
      })
    }))
    setIngredients(updatedIngredients)
  }

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity)
    if (selectedRecipe) {
      updateIngredients(selectedRecipe.ingredients, newQuantity)
    }
  }

  const handleIngredientChange = (id: string, field: keyof Ingredient, value: string | number) => {
    setIngredients(prev => prev.map(ing => {
      if (ing.id === id) {
        const updated = { ...ing }
        if (field === 'quantity') {
          updated.quantity = typeof value === 'string' ? parseInt(value) || 0 : value
        } else if (field === 'packageWeight') {
          updated.packageWeight = typeof value === 'string' ? parseInt(value) || 0 : value
        } else if (field === 'packagePrice') {
          updated.packagePrice = typeof value === 'string' ? parseCurrency(value) : value
        }
        updated.cost = calculateIngredientCost(updated)
        return updated
      }
      return ing
    }))
  }

  const handleCoverageChange = (coverageId: string) => {
    const coverage = coverages.find(c => c.id === coverageId)
    if (coverage) {
      setSelectedCoverage(coverage)
      setCoverageQuantity(coverage.packageWeight)
      updateCoverageIngredients(coverage)
    }
  }

  const updateCoverageIngredients = (coverage: Coverage) => {
    if (!coverage.ingredients) return
    
    const ratio = coverage.packageWeight / coverage.packageWeight // Base ratio
    const updatedIngredients = coverage.ingredients.map(ing => ({
      ...ing,
      id: Math.random().toString(36).substr(2, 9),
      quantity: Math.round(ing.quantity * ratio),
      packagePrice: 0, // Usuário vai preencher
      packageWeight: getDefaultPackageWeight(ing.name),
      cost: 0
    }))
    setCoverageIngredients(updatedIngredients)
  }

  const handleCoverageQuantityChange = (newQuantity: number) => {
    setCoverageQuantity(newQuantity)
    if (selectedCoverage && selectedCoverage.ingredients) {
      const ratio = newQuantity / selectedCoverage.packageWeight
      const updatedIngredients = coverageIngredients.map(ing => {
        const baseIngredient = selectedCoverage.ingredients!.find(base => base.name === ing.name)
        if (baseIngredient) {
          const newQuantityValue = Math.round(baseIngredient.quantity * ratio)
          const updatedIngredient = {
            ...ing,
            quantity: newQuantityValue
          }
          updatedIngredient.cost = calculateIngredientCost(updatedIngredient)
          return updatedIngredient
        }
        return ing
      })
      setCoverageIngredients(updatedIngredients)
    }
  }

  const handleCoverageIngredientChange = (id: string, field: keyof CoverageIngredient, value: string | number) => {
    setCoverageIngredients(prev => prev.map(ing => {
      if (ing.id === id) {
        const updated = { ...ing }
        if (field === 'quantity') {
          updated.quantity = typeof value === 'string' ? parseInt(value) || 0 : value
        } else if (field === 'packageWeight') {
          updated.packageWeight = typeof value === 'string' ? parseInt(value) || 0 : value
        } else if (field === 'packagePrice') {
          updated.packagePrice = typeof value === 'string' ? parseCurrency(value) : value
        }
        updated.cost = calculateIngredientCost(updated)
        return updated
      }
      return ing
    }))
  }

  const removeCoverageIngredient = (id: string) => {
    setCoverageIngredients(coverageIngredients.filter(ing => ing.id !== id))
  }

  const addCoverageIngredient = () => {
    const newIngredient: CoverageIngredient = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      quantity: 100,
      packagePrice: 0,
      packageWeight: 1000,
      cost: 0
    }
    setCoverageIngredients([...coverageIngredients, newIngredient])
  }

  const addExtra = () => {
    const newExtra: Extra = {
      id: Math.random().toString(36).substr(2, 9),
      item: '',
      quantity: 1,
      unitPrice: 0,
      cost: 0
    }
    setExtras([...extras, newExtra])
  }

  const handleExtraChange = (id: string, field: keyof Extra, value: string | number) => {
    setExtras(prev => prev.map(extra => {
      if (extra.id === id) {
        const updated = { ...extra }
        if (field === 'item') {
          updated.item = value as string
        } else if (field === 'quantity') {
          updated.quantity = typeof value === 'string' ? parseInt(value) || 1 : value
        } else if (field === 'unitPrice') {
          updated.unitPrice = typeof value === 'string' ? parseCurrency(value) : value
        }
        updated.cost = updated.quantity * updated.unitPrice
        return updated
      }
      return extra
    }))
  }

  const removeExtra = (id: string) => {
    setExtras(extras.filter(extra => extra.id !== id))
  }

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter(ing => ing.id !== id))
  }

  const addIngredient = () => {
    const newIngredient: Ingredient = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      quantity: 100,
      packagePrice: 0,
      packageWeight: 1000,
      cost: 0
    }
    setIngredients([...ingredients, newIngredient])
  }

  const handleMarginSelect = (margin: 'iniciante' | 'pro' | 'premium') => {
    setSelectedMargin(margin)
    setCustomFinalPrice(null) // Limpa o preço customizado quando seleciona uma margem
  }

  const copySummary = () => {
    const totalCost = calculateTotalCost()
    const finalPrice = calculateFinalPrice()
    const profit = calculateProfit()
    const marginPercentage = calculateDisplayMargin().toFixed(0)

    const summary = `🧁 CÁLCULO DE PRECIFICAÇÃO

Receita: ${productName || selectedRecipe?.name || 'Não selecionada'} (${quantity}g)

💰 CUSTO TOTAL: ${formatCurrency(totalCost)}
• Ingredientes: ${formatCurrency(ingredients.reduce((sum, ing) => sum + ing.cost, 0))}
• Cobertura: ${formatCurrency(coverageIngredients.reduce((sum, ing) => sum + ing.cost, 0))}
• Extras: ${formatCurrency(extras.reduce((sum, extra) => sum + extra.cost, 0))}

💵 PREÇO FINAL: ${formatCurrency(finalPrice)}
• Margem aplicada: ${marginPercentage}%
• Lucro: ${formatCurrency(profit)}

Calculado com Calculadora Express Caseirinho$ 20&Venda`

    navigator.clipboard.writeText(summary)
  }

  const saveCalculation = () => {
    const totalCost = calculateTotalCost()
    const finalPrice = calculateFinalPrice()
    const profit = calculateProfit()
    const marginPercentage = calculateDisplayMargin().toFixed(0)

    const summary = `🧁 CÁLCULO DE PRECIFICAÇÃO

Receita: ${productName || selectedRecipe?.name || 'Não selecionada'} (${quantity}g)

💰 CUSTO TOTAL: ${formatCurrency(totalCost)}
• Ingredientes: ${formatCurrency(ingredients.reduce((sum, ing) => sum + ing.cost, 0))}
• Cobertura: ${formatCurrency(coverageIngredients.reduce((sum, ing) => sum + ing.cost, 0))}
• Extras: ${formatCurrency(extras.reduce((sum, extra) => sum + extra.cost, 0))}

💵 PREÇO FINAL: ${formatCurrency(finalPrice)}
• Margem aplicada: ${marginPercentage}%
• Lucro: ${formatCurrency(profit)}

Calculado com Calculadora Express Caseirinho$ 20&Venda`

    // Criar uma nova janela para impressão
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Cálculo de Precificação</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
              pre { white-space: pre-wrap; font-family: Arial, sans-serif; }
            </style>
          </head>
          <body>
            <pre>${summary}</pre>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  // Função helper para validar email no Supabase
  const validateEmailInSupabase = async (email: string): Promise<{ valid: boolean; error?: string }> => {
    try {
      // Normalizar o email (trim e lowercase)
      const normalizedEmail = email.trim().toLowerCase()
      console.log('[Email Auth] Validando email:', normalizedEmail)
      
      // Verificar conectividade básica
      const testResult = await supabase
        .from('users_hub')
        .select('*')
        .limit(1)
      
      if (testResult.error) {
        console.error('[Email Auth] Erro de conectividade:', testResult.error)
        return { 
          valid: false, 
          error: testResult.error.code === '42501' 
            ? 'Erro de permissão no Supabase' 
            : 'Não foi possível conectar ao banco de dados' 
        }
      }
      
      // Buscar email específico
      const { data, error } = await supabase
        .from('users_hub')
        .select('email, nome')
        .eq('email', normalizedEmail)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.log('[Email Auth] Email não encontrado:', normalizedEmail)
          return { valid: false, error: 'E-mail não cadastrado' }
        }
        console.error('[Email Auth] Erro na query:', error)
        return { valid: false, error: error.message || 'Erro ao validar email' }
      }
      
      if (!data) {
        return { valid: false, error: 'E-mail não encontrado' }
      }
      
      console.log('[Email Auth] Email válido encontrado:', data)
      return { valid: true }
    } catch (error: any) {
      console.error('[Email Auth] Erro ao validar:', error)
      return { valid: false, error: error.message || 'Erro ao validar email' }
    }
  }

  // Verificar autenticação no localStorage ao carregar e parâmetros na URL
  useEffect(() => {
    const checkAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      
      // 1. Verificar se há parâmetro email na URL (auto-login via Plano Interativo)
      const emailParam = urlParams.get('email')
      
      if (emailParam) {
        console.log('[Email Auth] Parâmetro email encontrado na URL')
        setIsLoading(true)
        
        try {
          // Decodificar o email (pode estar codificado na URL)
          const decodedEmail = decodeURIComponent(emailParam)
          console.log('[Email Auth] Email decodificado:', decodedEmail)
          
          // Validar o email no Supabase
          const validation = await validateEmailInSupabase(decodedEmail)
          
          if (validation.valid) {
            console.log('[Email Auth] Email válido, liberando acesso...')
            
            // Normalizar email
            const normalizedEmail = decodedEmail.trim().toLowerCase()
            
            // Salvar sessão (similar ao login manual)
            saveSession(normalizedEmail)
            
            // Atualizar estado
            setAccessEmail(normalizedEmail)
            setIsAuthenticated(true)
            
            // Remover parâmetro da URL para não ficar visível
            window.history.replaceState({}, '', window.location.pathname)
            
            toast({
              title: "Login automático realizado!",
              description: "Bem-vinda ao LUCRÔ 🎉",
            })
          } else {
            console.error('[Email Auth] Email inválido:', validation.error)
            
            // Remover parâmetro inválido da URL
            window.history.replaceState({}, '', window.location.pathname)
            
            toast({
              title: "E-mail não cadastrado",
              description: validation.error || "Este e-mail não está cadastrado no Hub do curso.",
              variant: "destructive",
            })
          }
        } catch (error: any) {
          console.error('[Email Auth] Erro ao processar email da URL:', error)
          
          // Remover parâmetro da URL
          window.history.replaceState({}, '', window.location.pathname)
          
          toast({
            title: "Erro ao validar email",
            description: error.message || "Não foi possível fazer login automático.",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
        return // Não continuar verificando token/sessão se já processamos o email
      }
      
      // 2. Verificar se há sessão válida no localStorage
      const savedEmail = getValidSession()
      
      if (savedEmail) {
        console.log('[Auth] Email encontrado no localStorage:', savedEmail)
        setAccessEmail(savedEmail)
        setIsAuthenticated(true)
      }
    }
    
    checkAuth()
  }, [toast])


  const handleAccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    console.log('🚀 Iniciando validação de e-mail...')
    console.log('📊 Credenciais Supabase:', {
      url: supabase.supabaseUrl,
      keyPreview: supabase.supabaseKey?.substring(0, 20) + '...'
    })
    
    try {
      // Normalizar o email (trim e lowercase)
      const normalizedEmail = accessEmail.trim().toLowerCase()
      console.log('📧 E-mail normalizado:', normalizedEmail)
      
      // TESTE 1: Query simples para verificar conectividade
      console.log('🧪 TESTE 1: Verificando conectividade com query simples...')
      try {
        const testResult = await supabase
          .from('users_hub')
          .select('*')
          .limit(1)
        
        console.log('✅ TESTE 1 - Status:', testResult.status)
        console.log('✅ TESTE 1 - Dados:', testResult.data)
        console.log('❌ TESTE 1 - Erro:', testResult.error)
        
        if (testResult.error) {
          console.error('❌ TESTE 1 FALHOU! Detalhes do erro:', {
            code: testResult.error.code,
            message: testResult.error.message,
            details: testResult.error.details,
            hint: testResult.error.hint
          })
          
          if (testResult.error.code === '42501') {
            toast({
              title: "Erro de permissão",
              description: "A política RLS do Supabase está bloqueando. Verifique as configurações no dashboard.",
              variant: "destructive",
            })
            return
          }
          
          toast({
            title: "Falha na conexão",
            description: testResult.error.message || "Não foi possível conectar ao banco de dados.",
            variant: "destructive",
          })
          return
        }
        
        console.log('✅ TESTE 1 PASSOU - Conectividade OK!')
        
      } catch (connectError: any) {
        console.error('❌ TESTE 1 EXCEÇÃO:', connectError)
        console.error('Tipo do erro:', typeof connectError)
        console.error('Mensagem:', connectError?.message)
        console.error('Stack:', connectError?.stack)
        
        toast({
          title: "Erro de conexão",
          description: connectError?.message || "Não foi possível se conectar ao Supabase.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }
      
      // TESTE 2: Query com filtro de email
      console.log('🧪 TESTE 2: Buscando e-mail específico...')
      const { data, error, status, statusText } = await supabase
        .from('users_hub')
        .select('email')
        .eq('email', normalizedEmail)
        .single()

      console.log('📦 Status HTTP:', status, statusText)
      console.log('📦 Dados retornados:', JSON.stringify(data, null, 2))
      console.log('❌ Erro completo:', JSON.stringify(error, null, 2))
      console.log('❌ Error code:', error?.code)
      console.log('❌ Error message:', error?.message)
      console.log('❌ Error details:', error?.details)
      console.log('❌ Error hint:', error?.hint)

      if (error) {
        console.error('⚠️ Erro detectado na query!', error)
        
        if (error.code === 'PGRST116') {
          console.log('❌ PGRST116: E-mail não encontrado no banco')
          toast({
            title: "E-mail não cadastrado",
            description: "Faça seu cadastro no Hub do curso primeiro.",
            variant: "destructive",
          })
        } else if (error.code === 'PGRST301') {
          console.error('❌ PGRST301: Violação de política de segurança')
          toast({
            title: "Erro de permissão",
            description: "Verifique as políticas do Supabase.",
            variant: "destructive",
          })
        } else {
          console.error('❌ Outro erro:', error.code, error.message)
          toast({
            title: "Falha de conexão",
            description: error.message || "Não foi possível validar agora. Tente novamente em instantes.",
            variant: "destructive",
          })
        }
        return
      }

      if (!data) {
        console.log('❌ Nenhum dado retornado (mas sem erro?)')
        toast({
          title: "E-mail não cadastrado",
          description: "Faça seu cadastro no Hub do curso primeiro.",
          variant: "destructive",
        })
        return
      }

      // Se retornou dados, liberar acesso
      if (data) {
        console.log('✅ E-mail encontrado! Dados:', data)
        console.log('✅ Liberando acesso...')
        saveSession(normalizedEmail)
        setIsAuthenticated(true)
        toast({
          title: "Acesso liberado!",
          description: "Bem-vinda ao LUCRÔ 🎉",
        })
      }
    } catch (error: any) {
      console.error('❌❌❌ ERRO CAPTURADO NO CATCH ❌❌❌')
      console.error('📋 Origem:', window.location.origin)
      console.error('📋 Tipo do erro:', typeof error)
      console.error('📋 Error object:', error)
      console.error('📋 Error string:', JSON.stringify(error, null, 2))
      console.error('📋 Error message:', error?.message)
      console.error('📋 Error stack:', error?.stack)
      console.error('📋 Error name:', error?.name)
      console.error('📋 Error code:', error?.code)
      
      // Verificar se é CORS
      const isCorsError = error?.message?.includes('CORS') || 
                         error?.message?.includes('Access-Control') ||
                         error?.name === 'ChunkLoadError'
      
      console.error('🌐 É erro CORS?', isCorsError)
      
      const errorMessage = error?.message || 'Erro desconhecido'
      const isNetworkError = typeof error?.message === 'string' && (
        error.message.includes('Failed to fetch') || 
        error.message.includes('NetworkError') ||
        error.message.includes('ERR_NAME_NOT_RESOLVED') ||
        error.message.includes('ERR_CONNECTION_REFUSED')
      )
      
      console.log('🌐 É erro de rede?', isNetworkError)
      
      let message
      if (isCorsError) {
        message = { 
          title: "Erro de CORS", 
          description: "O Supabase pode estar bloqueando requisições do localhost. Verifique as configurações de API no dashboard." 
        }
      } else if (isNetworkError) {
        message = { title: "Falha de conexão", description: "Verifique sua internet e tente novamente." }
      } else {
        message = { title: "Erro ao validar", description: `Erro: ${errorMessage}` }
      }

      toast({
        ...message,
        variant: "destructive",
      })
    } finally {
      console.log('🏁 Finalizando validação...')
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    clearSession()
    setIsAuthenticated(false)
    setAccessEmail("")
    toast({
      title: "Você saiu",
      description: "Até a próxima!",
    })
  }

  const newCalculation = () => {
    setSelectedRecipe(null)
    setQuantity(900)
    setIngredients([])
    setSelectedCoverage(null)
    setCoverageQuantity(500)
    setCoverageIngredients([])
    setCoveragePrice(0)
    setExtras([])
    setSelectedMargin(null)
    setProductName('')
  }

  // Removido carregamento automático para iniciar com tela zerada
  // useEffect(() => {
  //   const saved = localStorage.getItem('calculadora_save')
  //   if (saved) {
  //     try {
  //       const data = JSON.parse(saved)
  //       setSelectedRecipe(data.recipe)
  //       setProductName(data.productName || '')
  //       setQuantity(data.quantity || 900)
  //       setIngredients(data.ingredients || [])
  //       setSelectedCoverage(data.coverage || null)
  //       setCoverageQuantity(data.coverageQuantity || 500)
  //       setCoverageIngredients(data.coverageIngredients || [])
  //       setCoveragePrice(data.coveragePrice || 0)
  //       setExtras(data.extras || [])
  //       setSelectedMargin(data.selectedMargin || null)
  //     } catch (e) {
  //       console.error('Erro ao carregar dados salvos')
  //     }
  //   }
  // }, [])

  const totalCost = calculateTotalCost()
  const finalPrice = calculateFinalPrice()
  const profit = calculateProfit()

  // Página de acesso
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md hover-lift animate-fade-in">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold" style={{ color: '#5b4034' }}>
              Acesso exclusivo para alunas do Caseirinhos 20&Venda
            </CardTitle>
            <CardDescription className="text-base" style={{ color: '#7a5548' }}>
              Digite o e-mail cadastrado na Hotmart para acessar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAccessSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="access-email" className="text-sm font-medium">
                  Digite o e-mail usado no seu cadastro da Hotmart
                </Label>
                <Input
                  id="access-email"
                  type="email"
                  value={accessEmail}
                  onChange={(e) => setAccessEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="h-12 transition-smooth"
                  required
                  disabled={isLoading}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 sm:h-14 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-smooth"
                disabled={isLoading}
              >
                {isLoading ? "Verificando..." : "Acessar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculadora (conteúdo principal)
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
        {/* Cabeçalho */}
        <header className="text-center py-8 sm:py-12 relative">
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="absolute top-4 right-4 gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-2 tracking-tight" style={{ color: '#5b4034' }}>
            LUCRÔ
          </h1>
          <p className="text-sm sm:text-base mb-3 font-medium" style={{ color: '#4a4a4a' }}>
            by Caseirinho$ 20&Venda
          </p>
          <p className="text-base sm:text-lg font-light" style={{ color: '#7a5548' }}>
            Sua calculadora express para lucrar rápido.
          </p>
        </header>

        {/* Bloco Bolo - Receita e Quantidade */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="text-foreground text-lg sm:text-xl">Escolha sua receita de bolo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Select onValueChange={handleRecipeChange}>
              <SelectTrigger className="h-12 transition-smooth">
                <SelectValue placeholder="Selecione uma receita" />
              </SelectTrigger>
              <SelectContent>
                {recipes.map(recipe => (
                  <SelectItem key={recipe.id} value={recipe.id}>
                    {recipe.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div>
              <Label className="text-foreground font-medium text-sm sm:text-base">Quanto você vai produzir?</Label>
              <div className="space-y-4 mt-3">
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 0)}
                  className="text-center text-lg h-12 transition-smooth"
                  placeholder="Gramas"
                />
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {[600, 900, 1200, 1500, 2000].map(qty => (
                    <Button
                      key={qty}
                      variant={quantity === qty ? "default" : "outline"}
                      onClick={() => handleQuantityChange(qty)}
                      className={`transition-smooth ${quantity === qty ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'border-primary text-primary hover:bg-primary/10'}`}
                    >
                      {qty}g
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ingredientes do Bolo */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="text-foreground text-lg sm:text-xl">Ingredientes do Bolo</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Cabeçalho das colunas - apenas desktop */}
            <div className="hidden md:grid grid-cols-5 gap-2 items-center px-2 pb-3 border-b font-medium text-sm text-muted-foreground mb-4">
              <div>Ingrediente</div>
              <div>Qtd</div>
              <div>Peso Emb (g)</div>
              <div>Preço Emb (R$)</div>
              <div>Custo (R$)</div>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
              {ingredients.map(ingredient => (
                <div key={ingredient.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center p-3 md:p-2 border rounded-lg transition-smooth hover:shadow-sm hover:border-primary/30">
                  <div className="space-y-1">
                    <label className="md:hidden text-xs font-medium text-muted-foreground block">Ingrediente</label>
                    <Input
                      value={ingredient.name}
                      onChange={(e) => handleIngredientChange(ingredient.id, 'name', e.target.value)}
                      placeholder="Nome do ingrediente"
                      className="text-sm transition-smooth"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="md:hidden text-xs font-medium text-muted-foreground block">Qtd</label>
                    <Input
                      type="number"
                      value={ingredient.quantity}
                      onChange={(e) => handleIngredientChange(ingredient.id, 'quantity', e.target.value)}
                      placeholder="Qtd"
                      className="text-sm transition-smooth"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="md:hidden text-xs font-medium text-muted-foreground block">Peso Emb (g)</label>
                    <Input
                      type="number"
                      value={ingredient.packageWeight}
                      onChange={(e) => handleIngredientChange(ingredient.id, 'packageWeight', parseInt(e.target.value) || 0)}
                      placeholder={ingredient.name.toLowerCase().includes('ovo') ? "Qtd. embalagem (ex: 12)" : "Peso emb"}
                      className="text-sm transition-smooth"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="md:hidden text-xs font-medium text-muted-foreground block">Preço Emb (R$)</label>
                    <Input
                      value={formatCurrency(ingredient.packagePrice)}
                      onChange={(e) => handleIngredientChange(ingredient.id, 'packagePrice', e.target.value)}
                      placeholder="Preço emb"
                      className="text-sm transition-smooth"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="md:hidden text-xs font-medium text-muted-foreground block">Custo (R$)</label>
                    <div className="text-sm font-semibold text-primary flex items-center justify-between">
                      <span>{formatCurrency(ingredient.cost)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeIngredient(ingredient.id)}
                        className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 ml-2 transition-smooth"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={addIngredient}
              variant="outline"
              className="mt-4 w-full border-primary text-primary hover:bg-primary/10 transition-smooth h-11"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar ingrediente
            </Button>
          </CardContent>
        </Card>

        {/* Bloco Cobertura - Receita e Quantidade */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="text-foreground text-lg sm:text-xl">Cobertura</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Select onValueChange={handleCoverageChange}>
              <SelectTrigger className="h-12 transition-smooth">
                <SelectValue placeholder="Escolha a cobertura" />
              </SelectTrigger>
              <SelectContent>
                {coverages.map(coverage => (
                  <SelectItem key={coverage.id} value={coverage.id}>
                    {coverage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedCoverage && (
              <div>
                <Label className="text-foreground font-medium text-sm sm:text-base">Quanto você vai produzir?</Label>
                <div className="space-y-4 mt-3">
                  <Input
                    type="number"
                    value={coverageQuantity}
                    onChange={(e) => handleCoverageQuantityChange(parseInt(e.target.value) || 0)}
                    className="text-center text-lg h-12 transition-smooth"
                    placeholder="Gramas"
                  />
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    {[300, 400, 500, 600, 750].map(qty => (
                      <Button
                        key={qty}
                        variant={coverageQuantity === qty ? "default" : "outline"}
                        onClick={() => handleCoverageQuantityChange(qty)}
                        className={`transition-smooth ${coverageQuantity === qty ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'border-primary text-primary hover:bg-primary/10'}`}
                      >
                        {qty}g
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ingredientes da Cobertura */}
        {selectedCoverage && (
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="text-foreground text-lg sm:text-xl">Ingredientes da Cobertura</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Cabeçalho das colunas - apenas desktop */}
              <div className="hidden md:grid grid-cols-5 gap-2 items-center px-2 pb-3 border-b font-medium text-sm text-muted-foreground mb-4">
                <div>Ingrediente</div>
                <div>Qtd</div>
                <div>Peso Emb (g)</div>
                <div>Preço Emb (R$)</div>
                <div>Custo (R$)</div>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
                {coverageIngredients.map(ingredient => (
                  <div key={ingredient.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center p-3 md:p-2 border rounded-lg transition-smooth hover:shadow-sm hover:border-primary/30">
                    <div className="space-y-1">
                      <label className="md:hidden text-xs font-medium text-muted-foreground block">Ingrediente</label>
                      <Input
                        value={ingredient.name}
                        onChange={(e) => handleCoverageIngredientChange(ingredient.id, 'name', e.target.value)}
                        placeholder="Nome do ingrediente"
                        className="text-sm transition-smooth"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="md:hidden text-xs font-medium text-muted-foreground block">Qtd</label>
                      <Input
                        type="number"
                        value={ingredient.quantity}
                        onChange={(e) => handleCoverageIngredientChange(ingredient.id, 'quantity', e.target.value)}
                        placeholder="Qtd"
                        className="text-sm transition-smooth"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="md:hidden text-xs font-medium text-muted-foreground block">Peso Emb (g)</label>
                      <Input
                        type="number"
                        value={ingredient.packageWeight}
                        onChange={(e) => handleCoverageIngredientChange(ingredient.id, 'packageWeight', parseInt(e.target.value) || 0)}
                        placeholder={ingredient.name.toLowerCase().includes('ovo') ? "Qtd. embalagem (ex: 12)" : "Peso emb"}
                        className="text-sm transition-smooth"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="md:hidden text-xs font-medium text-muted-foreground block">Preço Emb (R$)</label>
                      <Input
                        value={formatCurrency(ingredient.packagePrice)}
                        onChange={(e) => handleCoverageIngredientChange(ingredient.id, 'packagePrice', e.target.value)}
                        placeholder="Preço emb"
                        className="text-sm transition-smooth"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="md:hidden text-xs font-medium text-muted-foreground block">Custo (R$)</label>
                      <div className="text-sm font-semibold text-primary flex items-center justify-between">
                        <span>{formatCurrency(ingredient.cost)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCoverageIngredient(ingredient.id)}
                          className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 ml-2 transition-smooth"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                onClick={addCoverageIngredient}
                variant="outline"
                className="mt-4 w-full border-primary text-primary hover:bg-primary/10 transition-smooth h-11"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar ingrediente
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Custos Extras */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="text-foreground text-lg sm:text-xl">Custos Extras (Embalagem/Decoração)</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Cabeçalho das colunas - apenas desktop */}
            <div className="hidden md:grid grid-cols-5 gap-2 items-center px-2 pb-3 border-b font-medium text-sm text-muted-foreground mb-4">
              <div>Item</div>
              <div>Quantidade</div>
              <div>Preço unitário (R$)</div>
              <div>Custo (R$)</div>
              <div></div>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
              {extras.map(extra => (
                <div key={extra.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center p-3 md:p-2 border rounded-lg transition-smooth hover:shadow-sm hover:border-primary/30">
                  <div className="space-y-1">
                    <label className="md:hidden text-xs font-medium text-muted-foreground block">Item</label>
                    <Input
                      value={extra.item}
                      onChange={(e) => handleExtraChange(extra.id, 'item', e.target.value)}
                      placeholder="Nome do item"
                      className="text-sm transition-smooth"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="md:hidden text-xs font-medium text-muted-foreground block">Quantidade</label>
                    <Input
                      type="number"
                      value={extra.quantity}
                      onChange={(e) => handleExtraChange(extra.id, 'quantity', e.target.value)}
                      placeholder="Qtd"
                      className="text-sm transition-smooth"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="md:hidden text-xs font-medium text-muted-foreground block">Preço unitário (R$)</label>
                    <Input
                      value={formatCurrency(extra.unitPrice)}
                      onChange={(e) => handleExtraChange(extra.id, 'unitPrice', e.target.value)}
                      placeholder="Preço unit"
                      className="text-sm transition-smooth"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="md:hidden text-xs font-medium text-muted-foreground block">Custo (R$)</label>
                    <div className="text-sm font-semibold text-primary">
                      {formatCurrency(extra.cost)}
                    </div>
                  </div>
                  <div className="flex items-end justify-center md:justify-start">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExtra(extra.id)}
                      className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 transition-smooth"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={addExtra}
              variant="outline"
              className="mt-4 w-full border-primary text-primary hover:bg-primary/10 transition-smooth h-11"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Extra
            </Button>
            <div className="mt-6 p-4 bg-muted rounded-lg text-center">
              <span className="text-base sm:text-lg font-semibold text-foreground">
                Total custos extras: {formatCurrency(extras.reduce((sum, extra) => sum + extra.cost, 0))}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Resumo de Custos */}
        <Card className="gradient-primary text-primary-foreground hover-lift shadow-lg">
          <CardHeader>
            <CardTitle className="text-white text-xl sm:text-2xl font-bold">Custo Total: {formatCurrency(totalCost)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm sm:text-base">
              <div className="flex justify-between">
                <span>Ingredientes do Bolo:</span>
                <span className="font-medium">{formatCurrency(ingredients.reduce((sum, ing) => sum + ing.cost, 0))}</span>
              </div>
              <div className="flex justify-between">
                <span>Ingredientes da Cobertura:</span>
                <span className="font-medium">{formatCurrency(coverageIngredients.reduce((sum, ing) => sum + ing.cost, 0))}</span>
              </div>
              <div className="flex justify-between">
                <span>Extras:</span>
                <span className="font-medium">{formatCurrency(extras.reduce((sum, extra) => sum + extra.cost, 0))}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Escolha da Margem de Lucro */}
        <div className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Escolha sua margem de lucro</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              className={`cursor-pointer transition-smooth hover-lift ${selectedMargin === 'iniciante' ? 'ring-2 ring-primary shadow-md' : 'hover:border-primary/50'}`}
              onClick={() => handleMarginSelect('iniciante')}
            >
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center mb-3">
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 transition-smooth ${selectedMargin === 'iniciante' ? 'bg-primary border-primary' : 'border-muted-foreground'}`} />
                  <h3 className="font-semibold text-foreground text-base">Preço Iniciante</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">Confiança, primeiros clientes, margem menor sem prejuízo.</p>
                <p className="text-lg sm:text-xl font-bold text-primary">{formatCurrency(calculateTotalCost() * 2.5)}</p>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-smooth hover-lift ${selectedMargin === 'pro' ? 'ring-2 ring-primary shadow-md' : 'hover:border-primary/50'}`}
              onClick={() => handleMarginSelect('pro')}
            >
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center mb-3">
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 transition-smooth ${selectedMargin === 'pro' ? 'bg-primary border-primary' : 'border-muted-foreground'}`} />
                  <h3 className="font-semibold text-foreground text-base">Preço Pro</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">Padrão mercado, cobre ingredientes + trabalho + lucro justo.</p>
                <p className="text-lg sm:text-xl font-bold text-primary">{formatCurrency(calculateTotalCost() * 3.0)}</p>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-smooth hover-lift ${selectedMargin === 'premium' ? 'ring-2 ring-primary shadow-md' : 'hover:border-primary/50'}`}
              onClick={() => handleMarginSelect('premium')}
            >
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center mb-3">
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 transition-smooth ${selectedMargin === 'premium' ? 'bg-primary border-primary' : 'border-muted-foreground'}`} />
                  <h3 className="font-semibold text-foreground text-base">Preço Premium</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">Prática, qualidade, lucro confortável, diferenciação.</p>
                <p className="text-lg sm:text-xl font-bold text-primary">{formatCurrency(calculateTotalCost() * 3.5)}</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-accent/30 border-2 border-accent rounded-xl p-5 sm:p-6">
            <p className="text-sm sm:text-base text-foreground leading-relaxed">
              <strong className="font-semibold">Sugestão:</strong> você pode trabalhar dentro dessa faixa. Analise concorrentes e escolha qual faixa faz mais sentido. Pense no custo, posicionamento e no quanto se sente confortável em cobrar.
            </p>
          </div>
        </div>

        {/* Resumo Final */}
        {(selectedMargin || customFinalPrice !== null) && (
          <Card className="border-2 border-primary shadow-lg hover-lift">
            <CardHeader>
              <CardTitle className="text-foreground text-xl sm:text-2xl">Preço Final</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-foreground font-medium mb-2 block">Nome do produto</Label>
                <Input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Digite o nome do produto"
                  className="h-12 transition-smooth"
                />
              </div>
              <div>
                <Label className="text-foreground font-medium mb-2 block">Preço Final (R$) - editável</Label>
                <Input
                  value={formatCurrency(calculateFinalPrice())}
                  onChange={(e) => handleFinalPriceChange(e.target.value)}
                  placeholder="R$ 0,00"
                  className="text-3xl sm:text-4xl font-bold text-primary text-center bg-transparent border-none w-full py-4 transition-smooth"
                />
              </div>
              <div className="space-y-3 text-sm sm:text-base bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Custo total do produto:</span>
                  <span className="font-semibold text-foreground">{formatCurrency(calculateTotalCost())}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Margem:</span>
                  <span className="font-semibold text-foreground">{calculateDisplayMargin().toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Lucro:</span>
                  <span className="font-semibold text-accent-foreground">{formatCurrency(calculateProfit())}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botões de Ação */}
        <div className="space-y-3 pb-8">
          <Button
            onClick={saveCalculation}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 sm:h-14 text-base transition-smooth shadow-md hover:shadow-lg"
          >
            <Save className="h-5 w-5 mr-2" />
            Salvar
          </Button>
          <Button
            onClick={copySummary}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-12 sm:h-14 text-base transition-smooth shadow-md hover:shadow-lg"
          >
            <Copy className="h-5 w-5 mr-2" />
            Copiar Resumo
          </Button>
          <Button
            onClick={newCalculation}
            variant="outline"
            className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground h-12 sm:h-14 text-base transition-smooth"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Novo Cálculo
          </Button>
        </div>
      </div>
    </div>
  )
}