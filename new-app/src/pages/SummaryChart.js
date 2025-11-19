import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SummaryChart = ({ stats, loading }) => {
    // We need to format the stats data into an array of objects for Recharts
    const chartData = [
        {
            name: 'Users',
            Approved: stats?.users?.approvedToday || 0,
            Rejected: stats?.users?.rejectedToday || 0,
        },
        {
            name: 'Activity',
            'Admin Actions': stats?.activity?.adminActionsToday || 0,
            'Active Users': stats?.activity?.activeToday || 0,
        }
    ];

    if (loading) {
        return <div className="w-full h-64 bg-gray-700/50 rounded-lg animate-pulse"></div>;
    }

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart
                    data={chartData}
                    margin={{
                        top: 20,
                        right: 20,
                        left: -10, // Adjust to make Y-axis labels visible
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                    <XAxis dataKey="name" stroke="#A0AEC0" />
                    <YAxis stroke="#A0AEC0" />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1A202C',
                            borderColor: '#4A5568'
                        }}
                        labelStyle={{ color: '#E2E8F0' }}
                    />
                    <Legend wrapperStyle={{ color: '#E2E8F0' }} />
                    <Bar dataKey="Approved" fill="#48BB78" />
                    <Bar dataKey="Rejected" fill="#F56565" />
                    <Bar dataKey="Admin Actions" fill="#4299E1" />
                    <Bar dataKey="Active Users" fill="#9F7AEA" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SummaryChart;