import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { FiCheckCircle, FiXCircle, FiLoader, FiHome, FiFileText } from 'react-icons/fi';

const DocumentVerification = () => {
  const { reference } = useParams();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyDocument = async () => {
      try {
        const { data } = await api.get(`/requests/verify/${reference}`);
        setResult(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Ce document est introuvable ou non authentique.');
      } finally {
        setLoading(false);
      }
    };

    verifyDocument();
  }, [reference]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="bg-navy-900 px-6 py-8 text-center">
          <h2 className="text-2xl font-bold text-white tracking-tight">Vérification de Document</h2>
          <p className="text-navy-100 mt-2 text-sm">Portail d'Authenticité - Mairie de Dembéni</p>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <FiLoader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Vérification en cours...</p>
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
                <FiXCircle className="h-12 w-12 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Document Non Reconnu</h3>
              <p className="text-red-500 bg-red-50 p-4 rounded-lg text-sm border border-red-100">{error}</p>
            </div>
          ) : (
            <div className="text-center py-2">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
                <FiCheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Document Authentique</h3>
              
              <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden text-left">
                <div className="px-4 py-3 border-b border-gray-200 flex items-center">
                  <FiFileText className="text-gray-400 mr-3" />
                  <span className="font-semibold text-gray-700">Détails du document</span>
                </div>
                <div className="divide-y divide-gray-200 text-sm">
                  <div className="px-4 py-3 flex justify-between">
                    <span className="text-gray-500">Référence</span>
                    <span className="font-medium text-gray-900">{result.reference}</span>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <span className="text-gray-500">Bénéficiaire</span>
                    <span className="font-medium text-gray-900">{result.citizen}</span>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <span className="text-gray-500">Type d'acte</span>
                    <span className="font-medium text-gray-900 text-right max-w-[60%]">{result.type}</span>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <span className="text-gray-500">Délivrance</span>
                    <span className="font-medium text-gray-900">
                      {new Date(result.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <span className="text-gray-500">Statut de la demande</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {result.status}
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-6 text-xs text-gray-400 text-center">
                Ce document est certifié conforme par les services de l'état civil de la commune de Dembéni.
              </p>
            </div>
          )}

          <div className="mt-8">
            <Link
              to="/"
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiHome className="mr-2" />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DocumentVerification;
