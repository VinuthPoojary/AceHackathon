import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Clock, Users, CheckCircle } from "lucide-react";

export const AnalyticsChart = () => {
  const weeklyData = [
    { day: "Mon", patients: 145, avgWait: 28, completed: 142 },
    { day: "Tue", patients: 132, avgWait: 25, completed: 130 },
    { day: "Wed", patients: 158, avgWait: 32, completed: 155 },
    { day: "Thu", patients: 167, avgWait: 30, completed: 163 },
    { day: "Fri", patients: 149, avgWait: 27, completed: 147 },
    { day: "Sat", patients: 98, avgWait: 22, completed: 96 },
    { day: "Sun", patients: 87, avgWait: 20, completed: 85 },
  ];

  const maxPatients = Math.max(...weeklyData.map(d => d.patients));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Weekly Total</p>
              <p className="text-2xl font-bold text-primary">936</p>
            </div>
            <Users className="h-8 w-8 text-primary opacity-20" />
          </div>
        </Card>

        <Card className="p-4 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Wait</p>
              <p className="text-2xl font-bold text-warning">26 min</p>
            </div>
            <Clock className="h-8 w-8 text-warning opacity-20" />
          </div>
        </Card>

        <Card className="p-4 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-secondary">918</p>
            </div>
            <CheckCircle className="h-8 w-8 text-secondary opacity-20" />
          </div>
        </Card>

        <Card className="p-4 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold text-secondary">98%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-secondary opacity-20" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="patients" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="wait">Wait Times</TabsTrigger>
          <TabsTrigger value="completion">Completion</TabsTrigger>
        </TabsList>

        <TabsContent value="patients">
          <Card className="p-6 shadow-elevated">
            <h3 className="text-xl font-semibold mb-6">Weekly Patient Volume</h3>
            <div className="space-y-4">
              {weeklyData.map((data) => (
                <div key={data.day} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{data.day}</span>
                    <span className="text-muted-foreground">{data.patients} patients</span>
                  </div>
                  <div className="h-8 bg-accent rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-gradient-primary transition-all duration-500"
                      style={{ width: `${(data.patients / maxPatients) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="wait">
          <Card className="p-6 shadow-elevated">
            <h3 className="text-xl font-semibold mb-6">Average Wait Times</h3>
            <div className="space-y-4">
              {weeklyData.map((data) => (
                <div key={data.day} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{data.day}</span>
                    <span className="text-muted-foreground">{data.avgWait} min</span>
                  </div>
                  <div className="h-8 bg-accent rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-warning to-warning/70 transition-all duration-500"
                      style={{ width: `${(data.avgWait / 40) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="completion">
          <Card className="p-6 shadow-elevated">
            <h3 className="text-xl font-semibold mb-6">Completion Rates</h3>
            <div className="space-y-4">
              {weeklyData.map((data) => {
                const completionRate = (data.completed / data.patients) * 100;
                return (
                  <div key={data.day} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{data.day}</span>
                      <span className="text-muted-foreground">
                        {data.completed}/{data.patients} ({completionRate.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-8 bg-accent rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-gradient-success transition-all duration-500"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Insights */}
      <Card className="p-6 shadow-card bg-gradient-to-r from-accent/50 to-background">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-secondary" />
          Key Insights
        </h3>
        <ul className="space-y-3 text-sm">
          <li className="flex items-start">
            <span className="text-secondary mr-2">✓</span>
            <span>Wednesday and Thursday show peak patient volumes - consider additional staff allocation</span>
          </li>
          <li className="flex items-start">
            <span className="text-secondary mr-2">✓</span>
            <span>Weekend wait times are optimal (20-22 min) - weekday target should be similar</span>
          </li>
          <li className="flex items-start">
            <span className="text-secondary mr-2">✓</span>
            <span>98% completion rate indicates excellent patient flow management</span>
          </li>
          <li className="flex items-start">
            <span className="text-warning mr-2">⚠</span>
            <span>Wednesday shows highest wait time - review staffing and resource allocation</span>
          </li>
        </ul>
      </Card>
    </div>
  );
};
