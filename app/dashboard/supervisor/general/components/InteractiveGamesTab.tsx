'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Gamepad2, CheckCircle, XCircle, Loader2, Clock, CheckCircle2, Ban } from 'lucide-react';
import { interactiveGamesApi, type InteractiveGame } from '@/lib/api/interactive-games';
import { toast } from 'sonner';

interface InteractiveGamesTabProps {
  onApprove: (gameId: string) => Promise<void>;
  onReject: (gameId: string, reason: string) => Promise<void>;
}

export default function InteractiveGamesTab({ onApprove, onReject }: InteractiveGamesTabProps) {
  const [pendingGames, setPendingGames] = useState<InteractiveGame[]>([]);
  const [approvedGames, setApprovedGames] = useState<InteractiveGame[]>([]);
  const [rejectedGames, setRejectedGames] = useState<InteractiveGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<InteractiveGame | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [activeStatusTab, setActiveStatusTab] = useState<string>('pending');

  useEffect(() => {
    loadAllGames();
  }, []);

  const loadAllGames = async () => {
    try {
      setLoading(true);
      // Load all statuses in parallel
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        interactiveGamesApi.list({ status: 'pending' }),
        interactiveGamesApi.list({ status: 'approved' }),
        interactiveGamesApi.list({ status: 'rejected' })
      ]);
      setPendingGames(pendingRes.results || []);
      setApprovedGames(approvedRes.results || []);
      setRejectedGames(rejectedRes.results || []);
    } catch (error: any) {
      console.error('Error loading games:', error);
      toast.error('حدث خطأ في تحميل الألعاب');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedGame) return;
    setProcessing(true);
    try {
      await onApprove(selectedGame.id);
      setShowApprovalModal(false);
      setSelectedGame(null);
      loadAllGames(); // Reload all games
    } catch (error) {
      // Error handled by parent
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedGame || !rejectionReason.trim()) {
      toast.error('يرجى كتابة سبب الرفض');
      return;
    }
    setProcessing(true);
    try {
      await onReject(selectedGame.id, rejectionReason);
      setShowRejectionModal(false);
      setSelectedGame(null);
      setRejectionReason('');
      loadAllGames(); // Reload all games
    } catch (error) {
      // Error handled by parent
    } finally {
      setProcessing(false);
    }
  };

  const renderGamesList = (games: InteractiveGame[], status: 'pending' | 'approved' | 'rejected') => {
    if (games.length === 0) {
      return (
        <div className="text-center py-12">
          <Gamepad2 className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">
            {status === 'pending' && 'لا توجد ألعاب قيد المراجعة'}
            {status === 'approved' && 'لا توجد ألعاب موافق عليها'}
            {status === 'rejected' && 'لا توجد ألعاب مرفوضة'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {status === 'pending' && 'جميع الألعاب تم مراجعتها'}
            {status === 'approved' && 'لم يتم الموافقة على أي ألعاب بعد'}
            {status === 'rejected' && 'لم يتم رفض أي ألعاب'}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <Card key={game.id} className="hover:shadow-lg transition-shadow bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-start justify-between gap-2">
                <span className="flex-1">{game.title}</span>
                <Badge 
                  variant={status === 'approved' ? 'default' : status === 'rejected' ? 'destructive' : 'secondary'}
                  className={
                    status === 'approved' ? 'bg-green-500' : 
                    status === 'rejected' ? 'bg-red-500' : 
                    'bg-amber-500'
                  }
                >
                  {status === 'approved' && 'موافق عليها'}
                  {status === 'rejected' && 'مرفوضة'}
                  {status === 'pending' && 'قيد المراجعة'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{game.description}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                <span>المعلم: {game.teacher_name}</span>
              </div>
              {game.difficulty_level_display && (
                <div className="mb-4">
                  <Badge variant="outline" className="text-xs">
                    {game.difficulty_level_display}
                  </Badge>
                </div>
              )}
              {status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-green-50 hover:bg-green-100 border-green-300 text-green-700 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:border-green-700 dark:text-green-400"
                    onClick={() => {
                      setSelectedGame(game);
                      setShowApprovalModal(true);
                    }}
                  >
                    <CheckCircle className="w-4 h-4 ml-2" />
                    موافقة
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-red-50 hover:bg-red-100 border-red-300 text-red-700 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:border-red-700 dark:text-red-400"
                    onClick={() => {
                      setSelectedGame(game);
                      setShowRejectionModal(true);
                    }}
                  >
                    <XCircle className="w-4 h-4 ml-2" />
                    رفض
                  </Button>
                </div>
              )}
              {(status === 'approved' || status === 'rejected') && (
                <div className="space-y-2">
                  {game.approved_at && status === 'approved' && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      تاريخ الموافقة: {new Date(game.approved_at).toLocaleDateString('ar-SA')}
                    </div>
                  )}
                  {game.rejection_reason && status === 'rejected' && (
                    <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                      <strong>سبب الرفض:</strong> {game.rejection_reason}
                    </div>
                  )}
                  {game.play_count !== undefined && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      عدد مرات اللعب: {game.play_count}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-green-600 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          الألعاب التفاعلية
        </h2>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-base px-3 py-1">
            قيد المراجعة: {pendingGames.length}
          </Badge>
          <Badge variant="default" className="text-base px-3 py-1 bg-green-500">
            موافق عليها: {approvedGames.length}
          </Badge>
          <Badge variant="destructive" className="text-base px-3 py-1 bg-red-500">
            مرفوضة: {rejectedGames.length}
          </Badge>
        </div>
      </div>

      <Tabs value={activeStatusTab} onValueChange={setActiveStatusTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl p-2 gap-2 border-2 border-gray-200 dark:border-slate-700 rounded-2xl">
          <TabsTrigger 
            value="pending" 
            className="flex items-center gap-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400"
          >
            <Clock className="w-4 h-4" />
            قيد المراجعة ({pendingGames.length})
          </TabsTrigger>
          <TabsTrigger 
            value="approved"
            className="flex items-center gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400"
          >
            <CheckCircle2 className="w-4 h-4" />
            موافق عليها ({approvedGames.length})
          </TabsTrigger>
          <TabsTrigger 
            value="rejected"
            className="flex items-center gap-2 data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400"
          >
            <Ban className="w-4 h-4" />
            مرفوضة ({rejectedGames.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {renderGamesList(pendingGames, 'pending')}
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          {renderGamesList(approvedGames, 'approved')}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {renderGamesList(rejectedGames, 'rejected')}
        </TabsContent>
      </Tabs>

      {/* Approval Modal */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent className="max-w-md border-green-200 dark:border-green-800">
          <DialogHeader>
            <DialogTitle className="text-green-600 dark:text-green-400">
              موافقة على لعبة تفاعلية
            </DialogTitle>
            <DialogDescription>
              هل أنت متأكد من الموافقة على اللعبة "{selectedGame?.title}"؟
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowApprovalModal(false)}
              disabled={processing}
              className="px-4 py-2 text-sm"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleApprove}
              disabled={processing}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري المعالجة...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 ml-2" />
                  موافقة
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Modal */}
      <Dialog open={showRejectionModal} onOpenChange={setShowRejectionModal}>
        <DialogContent className="max-w-md border-red-200 dark:border-red-800">
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400">
              رفض لعبة تفاعلية
            </DialogTitle>
            <DialogDescription>
              يرجى كتابة سبب رفض اللعبة "{selectedGame?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="rejection-reason" className="text-sm font-semibold text-gray-900 dark:text-white">
                سبب الرفض *
              </Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="اكتب سبب الرفض..."
                rows={4}
                className="mt-2 text-sm border-2 rounded-lg resize-none"
                dir="rtl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowRejectionModal(false);
                setRejectionReason('');
              }}
              disabled={processing}
              className="px-4 py-2 text-sm"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleReject}
              disabled={processing || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري المعالجة...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 ml-2" />
                  رفض
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

