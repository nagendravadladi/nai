import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Bell, TrendingUp, FileText, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { FinanceData } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface FinanceHubProps {
  userId: number;
}

export default function FinanceHub({ userId }: FinanceHubProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    type: 'expense',
    amount: '',
    description: '',
    category: 'food',
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: financeData = [] } = useQuery<FinanceData[]>({
    queryKey: [`/api/finance/${userId}`],
  });

  const addEntryMutation = useMutation({
    mutationFn: async (entry: typeof newEntry) => {
      await apiRequest("POST", "/api/finance", { 
        ...entry, 
        userId,
        amount: parseInt(entry.amount) || 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/finance/${userId}`] });
      setShowAddModal(false);
      setNewEntry({ type: 'expense', amount: '', description: '', category: 'food' });
      toast({
        title: "Entry added!",
        description: "Finance data has been recorded.",
      });
    },
  });

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEntry.amount && newEntry.description) {
      addEntryMutation.mutate(newEntry);
    }
  };

  // Calculate totals
  const income = financeData
    .filter(d => d.type === 'income')
    .reduce((sum, d) => sum + d.amount, 0);

  const expenses = financeData
    .filter(d => d.type === 'expense')
    .reduce((sum, d) => sum + d.amount, 0);

  const savings = income - expenses;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getSavingsColor = () => {
    if (savings > 0) return 'text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-900';
    if (savings < 0) return 'text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900';
    return 'text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-600';
  };

  const getExpensesByCategory = () => {
    const categoryTotals: { [key: string]: number } = {};
    financeData
      .filter(d => d.type === 'expense' && d.category)
      .forEach(d => {
        categoryTotals[d.category!] = (categoryTotals[d.category!] || 0) + d.amount;
      });
    return categoryTotals;
  };

  const categoryExpenses = getExpensesByCategory();
  const topCategory = Object.entries(categoryExpenses)
    .sort(([,a], [,b]) => b - a)[0];

  return (
    <>
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <PieChart className="text-primary" />
            Finance Hub
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Budget Overview */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-green-100 dark:bg-green-900 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-green-800 dark:text-green-200">
                {formatCurrency(income)}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">Income</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-blue-800 dark:text-blue-200">
                {formatCurrency(expenses)}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">Expenses</p>
            </div>
            <div className={`rounded-lg p-3 text-center ${getSavingsColor()}`}>
              <p className="text-lg font-bold">
                {formatCurrency(savings)}
              </p>
              <p className="text-xs">Savings</p>
            </div>
          </div>

          {/* Insights */}
          {topCategory && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 mb-4 border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Top spending category:</strong> {topCategory[0]} ({formatCurrency(topCategory[1])})
              </p>
            </div>
          )}

          {/* Recent Transactions */}
          {financeData.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-sm text-gray-800 dark:text-white mb-2">Recent Transactions</h4>
              <div className="space-y-2">
                {financeData.slice(-3).reverse().map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{transaction.description}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {transaction.type} {transaction.category && `• ${transaction.category}`}
                      </p>
                    </div>
                    <span className={`font-bold text-sm ${
                      transaction.type === 'income' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Quick Actions */}
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => toast({ title: "Feature coming soon!", description: "Bill reminders will be available in the next update." })}
            >
              <Bell className="mr-2 h-4 w-4" />
              Bill Reminders
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => toast({ title: "Feature coming soon!", description: "Expense analytics will be available in the next update." })}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Expense Analytics
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => toast({ title: "Feature coming soon!", description: "PDF export will be available in the next update." })}
            >
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Financial Transaction</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddEntry} className="space-y-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={newEntry.type} onValueChange={(value) => setNewEntry({ ...newEntry, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                value={newEntry.amount}
                onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                placeholder="1000"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newEntry.description}
                onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                placeholder="Salary, Groceries, etc."
                required
              />
            </div>
            {newEntry.type === 'expense' && (
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newEntry.category} onValueChange={(value) => setNewEntry({ ...newEntry, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="food">Food & Dining</SelectItem>
                    <SelectItem value="transport">Transportation</SelectItem>
                    <SelectItem value="shopping">Shopping</SelectItem>
                    <SelectItem value="bills">Bills & Utilities</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex gap-2">
              <Button type="submit" disabled={addEntryMutation.isPending}>
                {addEntryMutation.isPending ? 'Adding...' : 'Add Transaction'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
