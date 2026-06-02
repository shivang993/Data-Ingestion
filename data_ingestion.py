import os
import sys
import pandas as pd
import numpy as np

def create_folders():
    """Create the specified data engineering folder structure."""
    folders = [
        "data/raw",
        "data/processed",
        "notebooks",
        "sql",
        "dashboard",
        "reports"
    ]
    print("--- STEP 1: INITIALIZING FOLDER STRUCTURE ---")
    for folder in folders:
        os.makedirs(folder, exist_ok=True)
        print(f"Directory created or verified: {folder}")
    print()

def generate_datasets():
    """Generates 10 standard mutual fund datasets with deliberate data engineering anomalies."""
    print("--- STEP 2: CREATING 10 RAW CSV DATASETS ---")
    
    # 1. Fund Master CSV
    # Includes standard AMFI codes, plus an anomaly scheme (129999) which is missing in NAV history
    fund_master_data = {
        'scheme_code': [125497, 119551, 120503, 118632, 119092, 120841, 129999],
        'fund_house': ['HDFC Mutual Fund', 'SBI Mutual Fund', 'ICICI Prudential Mutual Fund', 
                       'Nippon India Mutual Fund', 'Axis Mutual Fund', 'Kotak Mahindra Mutual Fund', 'Anomaly Asset Management'],
        'category': ['Equity', 'Equity', 'Equity', 'Equity', 'Equity', 'Equity', 'Hybrid'],
        'sub_category': ['Large Cap', 'Bluechip', 'Large & Midcap', 'Large Cap', 'Bluechip', 'Large Cap', 'Dynamic Asset Allocation'],
        'scheme_name': [
            'HDFC Top 100 Fund - Direct Plan - Growth Option',
            'SBI Bluechip Fund - Direct Plan - Growth',
            'ICICI Prudential Bluechip Fund - Direct Plan - Growth',
            'Nippon India Large Cap Fund - Direct Plan - Growth',
            'Axis Bluechip Fund - Direct Plan - Growth',
            'Kotak Bluechip Fund - Direct Plan - Growth',
            'Anomaly Ghost Fund - Direct Plan - Growth'
        ],
        'risk_grade': ['Very High', 'Very High', 'High', 'Very High', 'High', 'High', 'Moderate']
    }
    df_fund_master = pd.DataFrame(fund_master_data)
    df_fund_master.to_csv('data/raw/fund_master.csv', index=False)
    print("Created data/raw/fund_master.csv")

    # 2. NAV History CSV
    # Deliberate Anomaly: Scheme 119092 has a corrupted negative NAV (-72.4) on '2026-05-31'
    # And Anomaly Ghost Fund (129999) has no representation in nav_history at all!
    nav_history_data = {
        'scheme_code': [125497, 125497, 119551, 119551, 120503, 120503, 118632, 118632, 119092, 119092, 120841, 120841],
        'date': [
            '2026-06-01', '2026-05-31', '2026-06-01', '2026-05-31',
            '2026-06-01', '2026-05-31', '2026-06-01', '2026-05-31',
            '2026-06-01', '2026-05-31', '2026-06-01', '2026-05-31'
        ],
        'nav': [
            982.45, 978.20, 84.12, 83.95, 93.67, 92.80, 72.45, 71.90, 
            67.89, -72.40, 502.10, 499.50 # Anomaly: Axis Bluechip has negative NAV here
        ],
        'repurchase_price': [
            982.45, 978.20, 84.12, 83.95, 93.67, 92.80, 72.45, 71.90, 
            67.89, np.nan, 502.10, 499.50 # Anomaly: Axis has missing values too
        ],
        'sale_price': [
            992.27, 987.98, 84.96, 84.79, 94.61, 93.73, 73.17, 72.62, 
            68.57, 68.10, 507.12, 504.49
        ]
    }
    df_nav_history = pd.DataFrame(nav_history_data)
    df_nav_history.to_csv('data/raw/nav_history.csv', index=False)
    print("Created data/raw/nav_history.csv")

    # 3. User Portfolio CSV
    portfolio_data = {
        'portfolio_id': [1001, 1001, 1002, 1003, 1003],
        'user_id': ['USR901', 'USR901', 'USR902', 'USR903', 'USR903'],
        'scheme_code': [125497, 119551, 120503, 118632, 119092],
        'units_held': [15.2, 230.5, 450.0, 110.4, 85.0],
        'average_purchase_price': [920.00, 78.50, 88.00, 65.00, 68.00],
        'last_transaction_date': ['2026-05-15', '2026-05-20', '2026-05-28', '2026-05-22', '2026-05-24']
    }
    pd.DataFrame(portfolio_data).to_csv('data/raw/user_portfolio.csv', index=False)
    print("Created data/raw/user_portfolio.csv")

    # 4. Scheme Details CSV
    scheme_details_data = {
        'scheme_code': [125497, 119551, 120503, 118632, 119092, 120841],
        'fund_manager_id': ['MGR01', 'MGR02', 'MGR03', 'MGR04', 'MGR05', 'MGR06'],
        'aum_in_cr': [28450.50, 39600.20, 32150.10, 22400.80, 24100.30, 15300.90],
        'expense_ratio_percent': [1.12, 1.34, 1.21, 1.45, 1.18, 1.25],
        'launch_date': ['2013-01-01', '2013-01-01', '2013-01-01', '2013-01-01', '2013-01-01', '2013-01-01'],
        'dividend_type': ['Growth', 'Growth', 'Growth', 'Growth', 'Growth', 'Growth']
    }
    pd.DataFrame(scheme_details_data).to_csv('data/raw/scheme_details.csv', index=False)
    print("Created data/raw/scheme_details.csv")

    # 5. Transaction Log CSV
    # Deliberate Anomaly: Duplicated transaction_id 20005 representing double processing
    transaction_log_data = {
        'transaction_id': [20001, 20002, 20003, 20004, 20005, 20005], # Duplicate 20005
        'user_id': ['USR901', 'USR901', 'USR902', 'USR903', 'USR901', 'USR901'],
        'scheme_code': [125497, 119551, 120503, 118632, 119092, 119092],
        'type': ['BUY', 'BUY', 'BUY', 'BUY', 'BUY', 'BUY'],
        'units': [12.0, 150.0, 300.0, 110.4, 45.0, 45.0],
        'nav_at_transaction': [915.20, 77.80, 87.20, 65.00, 67.50, 67.50],
        'date': ['2026-05-01', '2026-05-05', '2026-05-10', '2026-05-22', '2026-05-24', '2026-05-24']
    }
    pd.DataFrame(transaction_log_data).to_csv('data/raw/transaction_log.csv', index=False)
    print("Created data/raw/transaction_log.csv")

    # 6. Market Indices CSV
    market_indices_data = {
        'date': ['2026-06-01', '2026-05-31', '2026-05-30', '2026-05-29'],
        'nifty_50': [22450.10, 22380.45, 22380.45, 22410.80],
        'nifty_next_50': [61210.30, 61080.50, 61080.50, 61150.20],
        'nifty_midcap_100': [49800.70, 49720.10, 49720.10, 49780.40]
    }
    pd.DataFrame(market_indices_data).to_csv('data/raw/market_indices.csv', index=False)
    print("Created data/raw/market_indices.csv")

    # 7. Fund Managers CSV
    fund_managers_data = {
        'fund_manager_id': ['MGR01', 'MGR02', 'MGR03', 'MGR04', 'MGR05', 'MGR06'],
        'name': ['Nirav Mehta', 'Srinivas Rao', 'Pankaj Patel', 'Meeti Shah', 'Abhishek Sharma', 'Deepika Verma'],
        'experience_years': [18, 15, 20, 11, 14, 12],
        'qualification': ['CFA, MBA', 'MBA', 'CA, CFA', 'M.Com, CFA', 'B.Tech, MBA', 'PGDM, CFA'],
        'start_date': ['2018-04-10', '2020-01-15', '2016-11-20', '2021-08-01', '2019-06-30', '2021-02-12']
    }
    pd.DataFrame(fund_managers_data).to_csv('data/raw/fund_managers.csv', index=False)
    print("Created data/raw/fund_managers.csv")

    # 8. Asset Allocation CSV
    asset_allocation_data = {
        'scheme_code': [125497, 119551, 120503, 118632, 119092, 120841],
        'equity_percent': [95.40, 97.20, 94.10, 96.80, 98.10, 93.90],
        'debt_percent': [2.10, 1.50, 3.20, 1.20, 0.50, 4.10],
        'cash_and_others_percent': [2.50, 1.30, 2.70, 2.00, 1.40, 2.00]
    }
    pd.DataFrame(asset_allocation_data).to_csv('data/raw/asset_allocation.csv', index=False)
    print("Created data/raw/asset_allocation.csv")

    # 9. Sector Holdings CSV
    sector_holdings_data = {
        'scheme_code': [125497, 125497, 119551, 119551, 120503, 120503],
        'sector': ['Financial Services', 'Technology', 'Financial Services', 'Auto', 'Financial Services', 'Pharma'],
        'holding_percent': [34.50, 15.20, 28.90, 12.10, 31.20, 14.80]
    }
    pd.DataFrame(sector_holdings_data).to_csv('data/raw/sector_holdings.csv', index=False)
    print("Created data/raw/sector_holdings.csv")

    # 10. Risk Metrics CSV
    risk_metrics_data = {
        'scheme_code': [125497, 119551, 120503, 118632, 119092, 120841],
        'beta': [1.02, 0.98, 1.05, 1.10, 0.95, 0.99],
        'sharpe_ratio': [1.45, 1.62, 1.50, 1.38, 1.55, 1.48],
        'alpha_percent': [2.10, 3.45, 2.75, 1.90, 2.90, 2.25],
        'standard_deviation_percent': [14.20, 13.80, 14.50, 15.10, 13.20, 13.90]
    }
    pd.DataFrame(risk_metrics_data).to_csv('data/raw/risk_metrics.csv', index=False)
    print("Created data/raw/risk_metrics.csv")
    print("Loaded and registered all 10 datasets in data/raw/\n")

def load_and_describe_datasets():
    """Loads all 10 mutual fund datasets and prints shapes, dtypes, and heads, highlighting anomalies."""
    print("--- STEP 3: LOADING AND EXPLORING DATASETS VIA PANDAS ---")
    datasets = {
        "fund_master": "data/raw/fund_master.csv",
        "nav_history": "data/raw/nav_history.csv",
        "user_portfolio": "data/raw/user_portfolio.csv",
        "scheme_details": "data/raw/scheme_details.csv",
        "transaction_log": "data/raw/transaction_log.csv",
        "market_indices": "data/raw/market_indices.csv",
        "fund_managers": "data/raw/fund_managers.csv",
        "asset_allocation": "data/raw/asset_allocation.csv",
        "sector_holdings": "data/raw/sector_holdings.csv",
        "risk_metrics": "data/raw/risk_metrics.csv"
    }

    loaded_dfs = {}
    for name, path in datasets.items():
        if os.path.exists(path):
            df = pd.read_csv(path)
            loaded_dfs[name] = df
            print(f"=== Dataset: {name}.csv ===")
            print(f"Shape: {df.shape}")
            print("\nDatatypes:")
            print(df.dtypes)
            print("\nLeading Rows (.head()):")
            print(df.head(2))
            print("-" * 50 + "\n")
        else:
            print(f"ERROR: Dataset not found: {path}\n")

    return loaded_dfs

def explore_fund_master(df_master):
    """Deep analysis of the fund_master, categorizations and AMFI scheme alignments."""
    print("--- STEP 4: EXPLORING FUND MASTER ---")
    print(f"Unique Fund Houses: {df_master['fund_house'].nunique()}")
    print(df_master['fund_house'].unique())
    print(f"\nUnique Categories: {df_master['category'].nunique()}")
    print(df_master['category'].unique())
    print(f"\nUnique Sub-Categories: {df_master['sub_category'].nunique()}")
    print(df_master['sub_category'].unique())
    print(f"\nUnique Risk Grades: {df_master['risk_grade'].nunique()}")
    print(df_master['risk_grade'].unique())
    
    print("\nAMFI Code Structure Analysis:")
    print("AMFI codes are standard 6-digit integers generated by Association of Mutual Funds in India.")
    print("Example: '125497' refers to HDFC Top 100 Direct Plan.")
    print()

def validate_codes_and_summarize(df_master, df_nav, df_transaction):
    """Validates core integration relations and generates a clean data quality report."""
    print("--- STEP 5: MUTUAL FUND DATA QUALITY AUDIT ---")
    
    anomalies = []
    
    # 1. Validation: Confirm every code in fund_master has a historical NAV record
    master_codes = set(df_master['scheme_code'])
    nav_codes = set(df_nav['scheme_code'])
    
    missing_codes = master_codes - nav_codes
    if missing_codes:
        print(f"⚠️  DATA QUALITY ISSUE: Found {len(missing_codes)} scheme(s) in fund_master that have NO data in nav_history:")
        for mc in missing_codes:
            fund_name = df_master[df_master['scheme_code'] == mc]['scheme_name'].values[0]
            anomalies.append({
                "source_file": "fund_master.csv",
                "severity": "CRITICAL",
                "issue_description": f"AMFI Code '{mc}' ({fund_name}) lacks entry records in nav_history.csv."
            })
            print(f"   * AMFI Code: {mc} -> {fund_name}")
    else:
        print("✅ Success: All AMFI codes in fund_master are mirrored in nav_history.")

    # 2. Validation: Negative NAV values
    negative_navs = df_nav[df_nav['nav'] <= 0]
    if not negative_navs.empty:
        print(f"⚠️  DATA QUALITY ISSUE: Found {len(negative_navs)} entry where historical NAV <= 0 (invalid marker):")
        for idx, row in negative_navs.iterrows():
            anomalies.append({
                "source_file": "nav_history.csv",
                "severity": "CRITICAL",
                "issue_description": f"Negative NAV value detected: Row indices ({idx}), AMFI Code '{int(row['scheme_code'])}' on {row['date']} has NAV = {row['nav']}."
            })
            print(f"   * scheme_code: {int(row['scheme_code'])} on date {row['date']} has NAV value {row['nav']}")
            
    # 3. Validation: Duplicate transactions in transaction log
    duplicated_tx = df_transaction[df_transaction.duplicated('transaction_id', keep=False)]
    if not duplicated_tx.empty:
        print(f"⚠️  DATA QUALITY ISSUE: Found duplicated entries in transaction_id log:")
        for tid in duplicated_tx['transaction_id'].unique():
            anomalies.append({
                "source_file": "transaction_log.csv",
                "severity": "WARNING",
                "issue_description": f"Duplicated Transaction ID '{tid}' representing double-processed orders in logging file."
            })
            print(f"   * Transaction ID {tid} is logged {len(duplicated_tx[duplicated_tx['transaction_id'] == tid])} times.")

    print("\n--- STEP 6: WRITING DATA QUALITY SUMMARY REPORT ---")
    df_anomalies = pd.DataFrame(anomalies)
    df_anomalies.to_csv('data/processed/data_quality_report.csv', index=False)
    print("Saved audit report to: data/processed/data_quality_report.csv")
    
    # Write a summary text file
    with open('data/processed/data_quality_summary.txt', 'w') as f:
        f.write("# DATA QUALITY ASSESSMENT SUMMARY\n")
        f.write("Date of audit: 2026-06-02\n")
        f.write("Dataset scanned: 10 core mutual fund ingestion datasets\n\n")
        f.write("## HIGH-LEVEL ANOMALIES IDENTIFIED:\n")
        for i, df_row in enumerate(anomalies, 1):
            f.write(f"{i}. [{df_row['severity']}] {df_row['source_file']}: {df_row['issue_description']}\n")
    print("Saved text summary to: data/processed/data_quality_summary.txt\n")

def main():
    create_folders()
    generate_datasets()
    loaded = load_and_describe_datasets()
    
    if "fund_master" in loaded:
        explore_fund_master(loaded["fund_master"])
        
    if "fund_master" in loaded and "nav_history" in loaded and "transaction_log" in loaded:
        validate_codes_and_summarize(loaded["fund_master"], loaded["nav_history"], loaded["transaction_log"])
        
    print("--- SUCCESS: Day 1 Ingestion and Analysis complete! ---")

if __name__ == "__main__":
    main()
