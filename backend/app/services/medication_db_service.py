"""
Service de base de données locale de médicaments
Parse les fichiers BDPM (Base de Données Publique du Médicament)
"""

import csv
from typing import List, Dict, Any, Optional
from pathlib import Path
import structlog

logger = structlog.get_logger()


class MedicationDBService:
    """Service pour gérer la base de données locale de médicaments"""
    
    def __init__(self):
        self.medications: List[Dict[str, Any]] = []
        self.compositions: Dict[str, List[Dict[str, Any]]] = {}
        self._loaded = False
        # Index pour recherche ultra-rapide
        self._category_index: Dict[str, List[int]] = {}
        self._substance_index: Dict[str, List[int]] = {}
        self._disease_index: Dict[str, List[int]] = {}
    
    def load_data(self):
        """Charge les données des fichiers BDPM"""
        if self._loaded:
            return
        
        try:
            data_dir = Path(__file__).parent.parent.parent / "data"
            
            # Charger les présentations
            presentations_file = data_dir / "CIS_CIP_bdpm.txt"
            compositions_file = data_dir / "CIS_COMPO_bdpm.txt"
            
            # IMPORTANT: Charger les compositions AVANT les présentations
            if compositions_file.exists():
                self._load_compositions(compositions_file)
            else:
                logger.warning("Fichier compositions non trouvé", path=str(compositions_file))
            
            if presentations_file.exists():
                self._load_presentations(presentations_file)
            else:
                logger.warning("Fichier présentations non trouvé", path=str(presentations_file))
            
            # Construire les index pour recherche ultra-rapide
            self._build_indexes()
            
            self._loaded = True
            logger.info("Base de données médicaments chargée", 
                       total_medications=len(self.medications),
                       categories=len(self._category_index),
                       substances=len(self._substance_index))
            
        except Exception as e:
            logger.error("Erreur chargement base de données", error=str(e))
    
    def _load_presentations(self, file_path: Path):
        """Charge le fichier des présentations"""
        try:
            with open(file_path, 'r', encoding='latin-1') as f:
                reader = csv.reader(f, delimiter='\t')
                
                for row in reader:
                    if len(row) < 3:
                        continue
                    
                    cis = row[0]
                    presentation = row[2]  # Description complète
                    
                    # Parser la présentation pour extraire infos
                    med_info = self._parse_presentation(cis, presentation)
                    if med_info:
                        self.medications.append(med_info)
                        
        except Exception as e:
            logger.error("Erreur lecture présentations", error=str(e))
    
    def _load_compositions(self, file_path: Path):
        """Charge le fichier des compositions"""
        try:
            with open(file_path, 'r', encoding='latin-1') as f:
                reader = csv.reader(f, delimiter='\t')
                
                for row in reader:
                    if len(row) < 6:
                        continue
                    
                    cis = row[0]
                    forme = row[1]
                    substance = row[3]
                    dosage = row[4]
                    
                    if cis not in self.compositions:
                        self.compositions[cis] = []
                    
                    self.compositions[cis].append({
                        'substance': substance,
                        'dosage': dosage,
                        'forme': forme
                    })
                    
        except Exception as e:
            logger.error("Erreur lecture compositions", error=str(e))
    
    def _parse_presentation(self, cis: str, presentation: str) -> Optional[Dict[str, Any]]:
        """Parse une ligne de présentation pour extraire les infos"""
        try:
            # Extraire forme et dosage de la présentation
            forme = self._extract_form(presentation)
            
            # Récupérer la composition
            composition = self.compositions.get(cis, [])
            substance = composition[0]['substance'] if composition else "Inconnu"
            
            # Déterminer la catégorie basée sur la substance
            category = self._determine_category(substance)
            
            return {
                'id': cis,
                'name': substance,
                'form': forme,
                'presentation': presentation,
                'category': category,
                'composition': composition
            }
        except Exception as e:
            logger.debug("Erreur parsing présentation", error=str(e))
            return None
    
    def _extract_form(self, presentation: str) -> str:
        """Extrait la forme du médicament"""
        presentation_lower = presentation.lower()
        
        if 'comprimé' in presentation_lower:
            return 'comprimé'
        elif 'gélule' in presentation_lower:
            return 'gélule'
        elif 'solution' in presentation_lower or 'sirop' in presentation_lower:
            return 'solution'
        elif 'suspension' in presentation_lower:
            return 'suspension'
        elif 'pommade' in presentation_lower or 'crème' in presentation_lower:
            return 'crème'
        elif 'injection' in presentation_lower:
            return 'injectable'
        elif 'goutte' in presentation_lower:
            return 'gouttes'
        else:
            return 'autre'
    
    def _build_indexes(self):
        """Construit des index pour recherche ultra-rapide O(1)"""
        for idx, med in enumerate(self.medications):
            # Index par catégorie
            category = med['category']
            if category not in self._category_index:
                self._category_index[category] = []
            self._category_index[category].append(idx)
            
            # Index par substance
            substance = med['name'].lower()
            for word in substance.split():
                if len(word) > 3:  # Ignorer mots courts
                    if word not in self._substance_index:
                        self._substance_index[word] = []
                    self._substance_index[word].append(idx)
            
            # Index par maladie/indication
            disease_keywords = self._get_disease_keywords_from_substance(substance)
            for keyword in disease_keywords:
                if keyword not in self._disease_index:
                    self._disease_index[keyword] = []
                self._disease_index[keyword].append(idx)
    
    def _get_indications_from_category(self, category: str, name: str) -> str:
        """Génère les indications thérapeutiques basées sur la catégorie et le nom"""
        name_lower = name.lower()
        
        # Antidouleurs
        if category == 'antidouleur':
            if 'paracétamol' in name_lower or 'paracetamol' in name_lower:
                return "Traitement des douleurs légères à modérées et/ou des états fébriles"
            elif 'ibuprofène' in name_lower or 'ibuprofen' in name_lower:
                return "Traitement des douleurs, fièvre et inflammations (anti-inflammatoire)"
            elif 'aspirine' in name_lower or 'aspirin' in name_lower:
                return "Traitement des douleurs, fièvre et prévention cardiovasculaire"
            elif 'kétoprofène' in name_lower or 'ketoprofen' in name_lower:
                return "Traitement des douleurs et inflammations articulaires et musculaires"
            elif 'diclofénac' in name_lower or 'diclofenac' in name_lower:
                return "Traitement des douleurs et inflammations rhumatismales"
            else:
                return "Traitement symptomatique de la douleur et/ou de la fièvre"
        
        # Antibiotiques
        elif category == 'antibiotique':
            if 'amoxicilline' in name_lower or 'amoxicillin' in name_lower:
                return "Traitement des infections bactériennes (ORL, respiratoires, urinaires)"
            elif 'azithromycine' in name_lower or 'azithromycin' in name_lower:
                return "Traitement des infections respiratoires et ORL"
            elif 'ciprofloxacine' in name_lower or 'ciprofloxacin' in name_lower:
                return "Traitement des infections urinaires et digestives"
            elif 'ceftriaxone' in name_lower:
                return "Traitement des infections bactériennes sévères"
            else:
                return "Traitement des infections bactériennes"
        
        # Antihistaminiques
        elif category == 'antihistaminique':
            if 'cétirizine' in name_lower or 'cetirizine' in name_lower:
                return "Traitement des allergies, rhinite allergique et urticaire"
            elif 'loratadine' in name_lower:
                return "Traitement symptomatique de la rhinite allergique et de l'urticaire"
            elif 'desloratadine' in name_lower:
                return "Traitement des symptômes allergiques (rhinite, urticaire)"
            else:
                return "Traitement des manifestations allergiques"
        
        # Antihypertenseurs
        elif category == 'antihypertenseur':
            return "Traitement de l'hypertension artérielle"
        
        # Antidiabétiques
        elif category == 'antidiabétique':
            if 'metformine' in name_lower or 'metformin' in name_lower:
                return "Traitement du diabète de type 2"
            elif 'insuline' in name_lower or 'insulin' in name_lower:
                return "Traitement du diabète (contrôle de la glycémie)"
            else:
                return "Traitement du diabète"
        
        # Vitamines
        elif category == 'vitamine':
            if 'calcium' in name_lower:
                return "Supplément en calcium pour la santé osseuse"
            elif 'fer' in name_lower or 'iron' in name_lower:
                return "Traitement et prévention des carences en fer"
            elif 'vitamine d' in name_lower or 'vitamin d' in name_lower:
                return "Prévention et traitement de la carence en vitamine D"
            else:
                return "Complément vitaminique et minéral"
        
        # Autre
        else:
            return f"Médicament de la catégorie {category}"
    
    def _extract_disease_keywords_from_indications(self, indications: str) -> List[str]:
        """Extrait les mots-clés de maladie depuis les indications Gemini"""
        keywords = set()  # Utiliser un set pour éviter les doublons
        
        # DOULEUR & FIÈVRE
        if any(word in indications for word in ['douleur', 'pain', 'mal', 'antalgique', 'analgésique']):
            keywords.update(['douleur', 'fièvre', 'inflammation'])
        if any(word in indications for word in ['fièvre', 'fever', 'fébrile', 'température', 'antipyrétique']):
            keywords.update(['douleur', 'fièvre'])
        
        # INFECTIONS
        if any(word in indications for word in ['infection', 'infectieux', 'bactérie', 'bacterial', 'antibiotique', 'antimicrobien']):
            keywords.update(['infection', 'bactérie'])
        
        # ALLERGIES
        if any(word in indications for word in ['allergie', 'allergy', 'allergique', 'antihistaminique', 'rhinite', 'urticaire']):
            keywords.update(['allergie', 'rhinite', 'urticaire'])
        
        # INFLAMMATION
        if any(word in indications for word in ['inflammation', 'inflammatoire', 'inflammatory', 'anti-inflammatoire']):
            keywords.update(['inflammation', 'douleur'])
        
        # TOUX
        if any(word in indications for word in ['toux', 'cough', 'antitussif', 'expectorant']):
            keywords.add('toux')
        
        # DIARRHÉE
        if any(word in indications for word in ['diarrhée', 'diarrhee', 'diarrhea', 'gastro', 'intestin']):
            keywords.add('infection')  # Souvent lié aux infections
        
        # PALUDISME
        if any(word in indications for word in ['paludisme', 'malaria', 'plasmodium', 'antipaludique']):
            keywords.add('infection')
        
        # DIABÈTE
        if any(word in indications for word in ['diabète', 'diabetes', 'glycémie', 'insuline', 'antidiabétique']):
            keywords.update(['diabète', 'glycémie'])
        
        # HYPERTENSION
        if any(word in indications for word in ['hypertension', 'tension', 'pression', 'antihypertenseur']):
            keywords.update(['hypertension', 'tension'])
        
        return list(keywords)
    
    def _get_disease_keywords_from_substance(self, substance: str) -> List[str]:
        """Extrait les mots-clés de maladie depuis la substance"""
        keywords = []
        substance_lower = substance.lower()
        
        # Antidouleurs
        if any(term in substance_lower for term in ['paracétamol', 'paracetamol', 'ibuprofène', 'ibuprofen', 'aspirine', 'diclofénac', 'kétoprofène']):
            keywords.extend(['douleur', 'fièvre', 'inflammation'])
        
        # Antibiotiques
        if any(term in substance_lower for term in ['amoxicilline', 'pénicilline', 'azithromycine', 'ciprofloxacine', 'ceftriaxone']):
            keywords.extend(['infection', 'bactérie'])
        
        # Antihistaminiques
        if any(term in substance_lower for term in ['cétirizine', 'cetirizine', 'loratadine', 'desloratadine', 'chlorphéniramine']):
            keywords.extend(['allergie', 'rhinite', 'urticaire'])
        
        # Antitussifs
        if any(term in substance_lower for term in ['dextrométhorphan', 'codéine', 'pholcodine']):
            keywords.append('toux')
        
        # Antihypertenseurs
        if any(term in substance_lower for term in ['amlodipine', 'lisinopril', 'losartan', 'valsartan', 'enalapril']):
            keywords.extend(['hypertension', 'tension'])
        
        # Antidiabétiques
        if any(term in substance_lower for term in ['metformine', 'metformin', 'insuline', 'insulin', 'glibenclamide']):
            keywords.extend(['diabète', 'glycémie'])
        
        return keywords
    
    def _determine_category(self, substance: str) -> str:
        """Détermine la catégorie thérapeutique basée sur la substance"""
        substance_lower = substance.lower()
        
        # Antidouleurs
        if any(term in substance_lower for term in [
            'paracétamol', 'paracetamol', 'acetaminophen',
            'ibuprofène', 'ibuprofen', 'aspirine', 'aspirin',
            'diclofénac', 'diclofenac', 'kétoprofène', 'ketoprofen'
        ]):
            return 'antidouleur'
        
        # Antibiotiques
        elif any(term in substance_lower for term in [
            'amoxicilline', 'amoxicillin', 'pénicilline', 'penicillin',
            'azithromycine', 'azithromycin', 'ciprofloxacine', 'ciprofloxacin',
            'ceftriaxone', 'cefixime'
        ]):
            return 'antibiotique'
        
        # Antihistaminiques
        elif any(term in substance_lower for term in [
            'cétirizine', 'cetirizine', 'loratadine', 'desloratadine',
            'chlorphéniramine', 'chlorpheniramine'
        ]):
            return 'antihistaminique'
        
        # Antihypertenseurs
        elif any(term in substance_lower for term in [
            'amlodipine', 'lisinopril', 'losartan', 'valsartan',
            'enalapril', 'ramipril'
        ]):
            return 'antihypertenseur'
        
        # Vitamines
        elif any(term in substance_lower for term in [
            'vitamine', 'vitamin', 'calcium', 'magnésium', 'magnesium',
            'fer', 'iron', 'zinc'
        ]):
            return 'vitamine'
        
        # Antidiabétiques
        elif any(term in substance_lower for term in [
            'metformine', 'metformin', 'insuline', 'insulin',
            'glibenclamide', 'gliclazide'
        ]):
            return 'antidiabétique'
        
        else:
            return 'autre'
    
    def get_suggestions(
        self,
        category: str,
        limit: int = 50,  # Augmenté pour retourner le max
        exclude_name: Optional[str] = None,
        indications: Optional[str] = None,
        active_ingredient: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Récupère des suggestions de médicaments ultra-performantes (O(1) avec index)
        Retourne le maximum de résultats pertinents
        """
        
        # Charger les données si pas encore fait
        if not self._loaded:
            self.load_data()
        
        # Set pour éviter les doublons (utilise les index pour performance)
        result_indices = set()
        
        # PRIORITÉ 1: Chercher par maladie/indication (le plus pertinent)
        if indications:
            indications_lower = indications.lower()
            disease_keywords = self._extract_disease_keywords_from_indications(indications_lower)
            
            # Utiliser l'index pour recherche O(1)
            for keyword in disease_keywords:
                if keyword in self._disease_index:
                    result_indices.update(self._disease_index[keyword])
        
        # PRIORITÉ 2: Chercher par principe actif similaire
        if active_ingredient:
            ingredient_words = active_ingredient.lower().split()
            for word in ingredient_words:
                if len(word) > 3 and word in self._substance_index:
                    result_indices.update(self._substance_index[word])
        
        # PRIORITÉ 3: Fallback sur la catégorie (toujours inclure)
        if category in self._category_index:
            result_indices.update(self._category_index[category])
        
        # Convertir les indices en médicaments
        filtered = [self.medications[idx] for idx in result_indices]
        
        # Exclure le médicament scanné
        if exclude_name:
            exclude_lower = exclude_name.lower()
            filtered = [
                med for med in filtered
                if exclude_lower not in med['name'].lower()
            ]
        
        # DÉDUPLIQUER par nom de substance (éviter les doublons)
        seen_names = set()
        unique_filtered = []
        for med in filtered:
            med_name = med['name'].lower()
            if med_name not in seen_names:
                seen_names.add(med_name)
                unique_filtered.append(med)
        
        # Limiter au nombre demandé
        suggestions = unique_filtered[:limit] if limit > 0 else unique_filtered
        
        # Formater pour l'API avec descriptions enrichies + indications
        return [
            {
                'id': med['id'],
                'name': med['name'],
                'form': med['form'],
                'category': med['category'],
                'presentation': med['presentation'][:100],
                'composition': med['composition'][0]['substance'] if med['composition'] else None,
                'dosage': med['composition'][0]['dosage'] if med['composition'] else None,
                'description': f"{med['form']} - {med['presentation'][:60]}",
                'indications': self._get_indications_from_category(med['category'], med['name'])
            }
            for med in suggestions
        ]


# Singleton
medication_db_service = MedicationDBService()
