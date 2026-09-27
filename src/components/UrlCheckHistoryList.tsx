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
  RefreshCw,
  ShieldCheck,
  ShieldX
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UrlCheckHistoryItem {
  id?: string;
  _id?: string;
  userId: string;
  url: string;
  domain?: string;
  verdict: 'SAFE' | 'DANGEROUS' | 'WARNING';
  scanResults?: {
    virusTotal?: any;
    googleSafeBrowsing?: any;
    whois?: any;
    aiAnalysis?: any;
  };
  virusTotalData?: {
    malicious: number;
    phishing: number;
    suspicious: number;
    harmless: number;
    undetected: number;
    total: number;
    permalink?: string;
  };
  googleSafeBrowsingData?: {
    threatsFound: boolean;
    matches: any[];
  };
  results?: any[];
  checkedAt: string | Date;
  createdAt?: string | Date;
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

  const getVerdictConfig = (verdict: string) => {
    switch (verdict) {
      case 'SAFE':
        return {
          icon: <ShieldCheck className="h-5 w-5 text-emerald-500" />,
          badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
          rowBorder: 'border-l-emerald-500/60',
        };
      case 'DANGEROUS':
        return {
          icon: <ShieldX className="h-5 w-5 text-red-500" />,
          badgeClass: 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30',
          rowBorder: 'border-l-red-500/60',
        };
      case 'WARNING':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
          badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
          rowBorder: 'border-l-amber-500/60',
        };
      default:
        return {
          icon: <Shield className="h-5 w-5 text-muted-foreground" />,
          badgeClass: 'bg-muted text-muted-foreground border border-border',
          rowBorder: 'border-l-border',
        };
    }
  };

  const formatDate = (dateString: string | Date) => {
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
    const vt = item.scanResults?.virusTotal || item.virusTotalData;
    if (!vt) return item.verdict === 'SAFE' ? 'Clean' : 'Threat Flagged';
    const threats = (vt.malicious || 0) + (vt.phishing || 0) + (vt.suspicious || 0);
    const total = vt.total || 0;

    if (threats === 0) {
      return total > 0 ? `Clean (${total} engines)` : 'Clean';
    }
    return `${threats}/${total || 0} engines flagged`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground text-sm">Loading history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-destructive mb-4 font-medium text-sm">{error}</p>
        <Button variant="outline" onClick={() => fetchHistory(1)} className="gap-2 text-sm">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
            URL Check History
          </h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            {totalCount} {totalCount === 1 ? 'scan' : 'scans'} total
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-accent transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ background: 'var(--muted)' }}
          >
            <Shield className="h-8 w-8" style={{ color: 'var(--muted-foreground)' }} />
          </div>
          <p className="text-lg font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            No URL checks yet
          </p>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Your scan history will appear here once you start checking URLs
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((item, index) => {
            const config = getVerdictConfig(item.verdict);
            return (
              <motion.div
                key={item.id || item._id || index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.25 }}
              >
                <div
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl border-l-4 ${config.rowBorder} transition-all duration-200 hover:shadow-lg cursor-default`}
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderLeftWidth: '4px',
                  }}
                >
                  {/* Verdict Icon */}
                  <div className="flex-shrink-0">{config.icon}</div>

                  {/* URL + Meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="font-medium text-sm truncate max-w-xs md:max-w-lg"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {item.url}
                      </span>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-shrink-0 hover:text-primary transition-colors"
                        style={{ color: 'var(--muted-foreground)' }}
                        title="Open URL"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(item.checkedAt)}
                      </span>
                      <span>·</span>
                      <span>{getThreatSummary(item)}</span>
                    </div>
                  </div>

                  {/* Verdict Badge + Arrow */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.badgeClass}`}>
                      {item.verdict}
                    </span>
                    <ChevronRight
                      className="h-4 w-4 group-hover:text-primary transition-colors"
                      style={{ color: 'var(--muted-foreground)' }}
                    />
                  </div>
                </div>

                {/* Extra VT Stats */}
                {item.virusTotalData && (item.virusTotalData.malicious > 0 || item.virusTotalData.phishing > 0 || item.virusTotalData.suspicious > 0) && (
                  <div
                    className="mt-1 ml-8 flex flex-wrap gap-3 text-xs px-4 pb-2"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    {item.virusTotalData.malicious > 0 && (
                      <span className="text-red-500 font-medium">{item.virusTotalData.malicious} malicious</span>
                    )}
                    {item.virusTotalData.phishing > 0 && (
                      <span className="text-orange-500 font-medium">{item.virusTotalData.phishing} phishing</span>
                    )}
                    {item.virusTotalData.suspicious > 0 && (
                      <span className="text-amber-500 font-medium">{item.virusTotalData.suspicious} suspicious</span>
                    )}
                    {item.googleSafeBrowsingData?.threatsFound && (
                      <span className="text-red-500 font-medium">GSB: Threats detected</span>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}

          {hasMore && (
            <div className="text-center pt-6">
              <Button variant="outline" onClick={loadMore} disabled={loadingMore} className="gap-2 text-sm">
                {loadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
