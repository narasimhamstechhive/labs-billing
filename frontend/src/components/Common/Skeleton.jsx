import React from 'react';

const Skeleton = ({ className, height, width, circle, ...props }) => {
    const style = {
        height: height || '1rem',
        width: width || '100%',
        borderRadius: circle ? '50%' : '0.5rem',
    };

    return (
        <div
            className={`animate-pulse bg-gray-200 ${className}`}
            style={style}
            {...props}
        />
    );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
    <div className="w-full space-y-4 animate-in fade-in duration-500">
        <div className="flex gap-4 mb-6">
            {[...Array(cols)].map((_, i) => (
                <Skeleton key={i} height="2rem" />
            ))}
        </div>
        {[...Array(rows)].map((_, i) => (
            <div key={i} className="flex gap-4 border-b border-gray-100 pb-4">
                {[...Array(cols)].map((_, j) => (
                    <Skeleton key={j} height="1.5rem" />
                ))}
            </div>
        ))}
    </div>
);

export const CardSkeleton = ({ count = 3 }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
        {[...Array(count)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <Skeleton height="1rem" width="40%" className="mb-4" />
                <Skeleton height="2rem" width="60%" />
            </div>
        ))}
    </div>
);

export const DashboardSkeleton = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
            <div className="space-y-2 w-1/3">
                <Skeleton height="2.5rem" width="80%" />
                <Skeleton height="1rem" width="60%" />
            </div>
            <Skeleton height="2.5rem" width="100px" />
        </div>
        <CardSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 h-80">
                <Skeleton height="1.5rem" width="30%" className="mb-6" />
                <Skeleton height="100%" />
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 h-80">
                <Skeleton height="1.5rem" width="30%" className="mb-6" />
                <TableSkeleton rows={4} cols={3} />
            </div>
        </div>
    </div>
);

export default Skeleton;
