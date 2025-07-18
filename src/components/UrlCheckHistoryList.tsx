"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  X, 
  Clock, 
  ExternalLink, 
  ChevronRight,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface UrlCheckHistoryItem {
  _id: string;
  userId: string;
  url: string;
  domain: string;
  verdict: 'SAFE' | 'DANGEROUS' | 'WARNING';
  virusTotalData: {
    malicious: number;
    phishing: number;
    suspicious: number;
    harmless: number;
    undetected: number;
    total: number;
    permalink?: string;
  };
  googleSafeBrowsingData: {
    threatsFound: boolean;
    matches: any[];
  };
  results: any[];
  checkedAt: Date;
  createdAt: Date;
}

interface UrlCheckHistoryResponse {
  success: boolean;
  message: string;
  data: UrlCheckHistoryItem[];
  totalCount: number;
}

interface UrlCheckHistoryListProps {
  onClose?: () => void;
}

export default function UrlCheckHistoryList({ onClose }: UrlCheckHistoryListProps) {
  const [history, setHistory] = useState<UrlCheckHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const fetchHistory = async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const offset = (pageNum - 1) * ITEMS_PER_PAGE;
      const response = await fetch(
        `/api/url-check-history?limit=${ITEMS_PER_PAGE}&offset=${offset}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }

      const data: UrlCheckHistoryResponse = await response.json();

      if (data.success) {
        if (append) {
          setHistory(prev => [...prev, ...data.data]);
        } else {
          setHistory(data.data);
        }
        setTotalCount(data.totalCount);
        setHasMore(data.data.length === ITEMS_PER_PAGE && history.length + data.data.length < data.totalCount);
      } else {
        setError(data.message || 'Failed to fetch history');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);
  }, []);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchHistory(nextPage, true);
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'SAFE':
        return <Shield className="h-5 w-5 text-green-500" />;
      case 'DANGEROUS':
        return <X className="h-5 w-5 text-red-500" />;
      case 'WARNING':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Shield className="h-5 w-5 text-gray-500" />;
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'SAFE':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'DANGEROUS':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'WARNING':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getThreatSummary = (item: UrlCheckHistoryItem) => {
    const threats = item.virusTotalData.malicious + item.virusTotalData.phishing + item.virusTotalData.suspicious;
    const total = item.virusTotalData.total;
    
    if (threats === 0) {
      return `Clean (${total} engines)`;
    }
    return `${threats}/${total} engines flagged`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => fetchHistory(1)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <RefreshCw className="h-4 w-4 inline mr-2" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">URL Check History</h2>
          <p className="text-gray-600 mt-1">
            {totalCount} {totalCount === 1 ? 'scan' : 'scans'} total
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg mb-2">No URL checks yet</p>
          <p>Your scan history will appear here once you start checking URLs</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getVerdictIcon(item.verdict)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 truncate max-w-md">
                          {item.url}
                        </span>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-500 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDate(item.checkedAt)}
                        </span>
                        <span>{getThreatSummary(item)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getVerdictColor(item.verdict)}`}>
                    {item.verdict}
                  </span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>

              {item.virusTotalData && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-6 text-sm">
                    {item.virusTotalData.malicious > 0 && (
                      <span className="text-red-600">
                        {item.virusTotalData.malicious} malicious
                      </span>
                    )}
                    {item.virusTotalData.phishing > 0 && (
                      <span className="text-orange-600">
                        {item.virusTotalData.phishing} phishing
                      </span>
                    )}
                    {item.virusTotalData.suspicious > 0 && (
                      <span className="text-yellow-600">
                        {item.virusTotalData.suspicious} suspicious
                      </span>
                    )}
                    {item.virusTotalData.harmless > 0 && (
                      <span className="text-green-600">
                        {item.virusTotalData.harmless} clean
                      </span>
                    )}
                    {item.googleSafeBrowsingData?.threatsFound && (
                      <span className="text-red-600">
                        Google Safe Browsing: Threats detected
                      </span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}

          {hasMore && (
            <div className="text-center py-6">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
