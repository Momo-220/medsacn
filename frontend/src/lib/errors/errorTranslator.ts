/**
 * Service de traduction d'erreurs
 * Convertit les erreurs techniques en messages simples et compréhensibles
 */

export interface ErrorInfo {
  message: string;
  title?: string;
  type: 'error' | 'warning' | 'info';
  action?: string;
}

class ErrorTranslator {
  /**
   * Traduit une erreur en message utilisateur simple
   */
  translate(error: any): ErrorInfo {
    // Erreur réseau
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
      return {
        title: 'Problème de connexion',
        message: 'Vérifiez votre connexion internet et réessayez.',
        type: 'error',
        action: 'Vérifier la connexion'
      };
    }

    // Timeout
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return {
        title: 'Temps d\'attente dépassé',
        message: 'La requête prend trop de temps. Réessayez dans quelques instants.',
        type: 'error',
        action: 'Réessayer'
      };
    }

    // Erreurs HTTP
    const status = error.response?.status || error.status;
    
    if (status === 400) {
      return {
        title: 'Requête incorrecte',
        message: this.extractMessage(error) || 'Les informations envoyées ne sont pas valides. Vérifiez vos données.',
        type: 'error'
      };
    }

    if (status === 401) {
      return {
        title: 'Connexion requise',
        message: 'Vous devez vous connecter pour utiliser cette fonctionnalité.',
        type: 'warning',
        action: 'Se connecter'
      };
    }

    if (status === 402) {
      return {
        title: 'Crédits insuffisants',
        message: 'Vous n\'avez plus assez de gemmes pour effectuer cette action. Ajoutez des gemmes pour continuer.',
        type: 'warning',
        action: 'Ajouter des gemmes'
      };
    }

    if (status === 403) {
      return {
        title: 'Accès refusé',
        message: 'Vous n\'avez pas la permission d\'effectuer cette action.',
        type: 'error'
      };
    }

    if (status === 404) {
      return {
        title: 'Contenu introuvable',
        message: 'La ressource demandée n\'existe pas ou a été supprimée.',
        type: 'error'
      };
    }

    if (status === 422) {
      const message = this.extractMessage(error);
      return {
        title: 'Données invalides',
        message: message || 'Les données fournies ne sont pas valides. Vérifiez vos informations.',
        type: 'error'
      };
    }

    if (status === 429) {
      return {
        title: 'Trop de requêtes',
        message: 'Vous avez effectué trop de requêtes. Veuillez patienter une minute avant de réessayer.',
        type: 'warning',
        action: 'Attendre'
      };
    }

    if (status === 500) {
      return {
        title: 'Erreur serveur',
        message: 'Un problème est survenu sur le serveur. Notre équipe en a été informée. Réessayez dans quelques instants.',
        type: 'error',
        action: 'Réessayer'
      };
    }

    if (status === 503) {
      return {
        title: 'Service indisponible',
        message: 'Le service est temporairement indisponible. Veuillez réessayer dans quelques minutes.',
        type: 'warning',
        action: 'Réessayer plus tard'
      };
    }

    // Erreurs spécifiques Gemini
    if (error.message?.includes('quota') || error.message?.includes('Quota')) {
      return {
        title: 'Quota dépassé',
        message: 'Le service d\'intelligence artificielle a atteint sa limite. Réessayez dans quelques minutes.',
        type: 'warning',
        action: 'Réessayer plus tard'
      };
    }

    if (error.message?.includes('INSUFFICIENT_CREDITS')) {
      return {
        title: 'Gemmes insuffisantes',
        message: 'Vous n\'avez plus assez de gemmes. Ajoutez-en pour continuer à utiliser l\'application.',
        type: 'warning',
        action: 'Ajouter des gemmes'
      };
    }

    // Erreurs de validation
    if (error.message?.includes('validation') || error.message?.includes('Validation')) {
      return {
        title: 'Données invalides',
        message: this.extractMessage(error) || 'Vérifiez que toutes les informations sont correctes.',
        type: 'error'
      };
    }

    // Erreurs de fichier
    if (error.message?.includes('file') || error.message?.includes('image') || error.message?.includes('photo')) {
      return {
        title: 'Problème avec le fichier',
        message: 'Le fichier sélectionné n\'est pas valide. Utilisez une image (JPG, PNG, WebP) de moins de 10 Mo.',
        type: 'error'
      };
    }

    // Erreurs de caméra
    if (error.message?.includes('camera') || error.message?.includes('caméra') || error.message?.includes('permission')) {
      return {
        title: 'Accès à la caméra refusé',
        message: 'Autorisez l\'accès à la caméra dans les paramètres de votre navigateur pour utiliser cette fonctionnalité.',
        type: 'warning',
        action: 'Autoriser la caméra'
      };
    }

    // Erreurs de Service Worker / Notifications
    if (error.message?.includes('Service Worker') || error.message?.includes('notification')) {
      return {
        title: 'Notifications indisponibles',
        message: 'Les notifications ne sont pas disponibles. Vérifiez les paramètres de votre navigateur.',
        type: 'warning'
      };
    }

    // Erreur générique
    const extractedMessage = this.extractMessage(error);
    if (extractedMessage && extractedMessage !== error.message) {
      return {
        title: 'Une erreur est survenue',
        message: this.simplifyMessage(extractedMessage),
        type: 'error',
        action: 'Réessayer'
      };
    }

    return {
      title: 'Une erreur est survenue',
      message: 'Un problème inattendu s\'est produit. Réessayez dans quelques instants.',
      type: 'error',
      action: 'Réessayer'
    };
  }

  /**
   * Extrait le message d'erreur depuis la réponse
   */
  private extractMessage(error: any): string {
    if (error.response?.data?.detail) {
      const detail = error.response.data.detail;
      if (Array.isArray(detail)) {
        return detail.map((err: any) => {
          const field = err.loc?.join('.') || '';
          const msg = err.msg || '';
          return field ? `${field}: ${msg}` : msg;
        }).join(', ');
      }
      return String(detail);
    }
    
    if (error.response?.data?.message) {
      return String(error.response.data.message);
    }
    
    if (error.response?.data?.error) {
      return String(error.response.data.error);
    }
    
    if (error.message) {
      return String(error.message);
    }
    
    return '';
  }

  /**
   * Simplifie un message technique
   */
  private simplifyMessage(message: string): string {
    let simplified = message;

    // Remplacer les termes techniques
    simplified = simplified.replace(/HTTP error! status: \d+/gi, 'Erreur de connexion');
    simplified = simplified.replace(/ECONNABORTED/gi, 'Connexion interrompue');
    simplified = simplified.replace(/ERR_NETWORK/gi, 'Problème de réseau');
    simplified = simplified.replace(/Failed to fetch/gi, 'Impossible de se connecter');
    simplified = simplified.replace(/timeout/gi, 'Temps d\'attente dépassé');
    simplified = simplified.replace(/ValidationError/gi, 'Données invalides');
    simplified = simplified.replace(/RateLimitExceededError/gi, 'Trop de requêtes');
    simplified = simplified.replace(/AIServiceError/gi, 'Service IA indisponible');
    simplified = simplified.replace(/DatabaseError/gi, 'Erreur de base de données');
    simplified = simplified.replace(/ImageProcessingError/gi, 'Impossible de traiter l\'image');
    simplified = simplified.replace(/AuthenticationError/gi, 'Problème de connexion');
    simplified = simplified.replace(/AuthorizationError/gi, 'Accès refusé');
    simplified = simplified.replace(/ResourceNotFoundError/gi, 'Contenu introuvable');

    // Nettoyer les messages
    simplified = simplified.replace(/^Error: /i, '');
    simplified = simplified.replace(/^Exception: /i, '');
    simplified = simplified.trim();

    return simplified || 'Une erreur est survenue';
  }
}

export const errorTranslator = new ErrorTranslator();
