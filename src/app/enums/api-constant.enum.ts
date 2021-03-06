import { environment } from '../../environments/environment';

export const API_URL = environment.apiUrl;

export const ApiConstant = {
    LOGIN: `${API_URL}/api/auth/token`,
    FORGOT_PASSWORD: `${API_URL}/api/password/reset-code`,
    RESET_PASSWORD: `${API_URL}/api/password?code={{resetCode}}`,
    SITES: `${API_URL}/api/sites`,
    SITE_TURBINES: `${API_URL}/api/sites/{{siteKey}}/turbines`,
    SITE_SIGNAL_LIMITS: `${API_URL}/api/sites/{{siteKey}}/signal-limits`,
    SITE_FORCAST_SIGNALS: `${API_URL}/api/sites/{{siteKey}}/forecast-signals`,
    SITE_LIVE_SIGNALS: `${API_URL}/api/sites/{{siteKey}}/live-signals`,
    TURBINE_FORECAST: `${API_URL}/api/sites/{{siteKey}}/turbines/{{turbineKey}}/forecast`,
    TURBINE_FORECAST_SIGNALS: `${API_URL}/api/sites/{{siteKey}}/turbines/{{turbineKey}}/forecast-signals`,
    SITE_FORCAST_BY_SIGNAL: `${API_URL}/api/sites/{{siteKey}}/turbines/forecast/{{signalKey}}`,
    TURBINE_LIVE: `${API_URL}/api/sites/{{siteKey}}/live-data`,
    FEEDBACK_LOGS: `${API_URL}/api/sites/{{siteKey}}/transfers`,
    HOURLY_ACCESS: `${API_URL}/api/sites/{{siteKey}}/hourly-access`,
    CANCELLATION_REASONS: `${API_URL}/api/sites/{{siteKey}}/transfers/cancellation-reasons`,
    CREATE_LOG: `${API_URL}/api/sites/{{siteKey}}/transfers`,
    DELETE_LOG: `${API_URL}/api/sites/{{siteKey}}/transfers/{{transferId}}`,
    EDIT_LOG: `${API_URL}/api/sites/{{siteKey}}/transfers/{{transferId}}`,
    GET_VESSELS: `${API_URL}/api/sites/{{siteKey}}/vessels`,
    ACCESSIBILITY_REPORT: `${API_URL}/api/sites/{{siteKey}}/reporting/access`,
    GET_ADMIN_USERS: `${API_URL}/api/users`,
    SEND_WELCOME_EMAILS: `${API_URL}/api/users/welcome`,
    DEACTIVATE_ACCOUNTS: `${API_URL}/api/users/deactivate`,
    UPDATE_USERS_ROLE: `${API_URL}/api/users/role`,
    USER_ROLES: `${API_URL}/api/users/roles`,
    UPDATE_USER_INFO: `${API_URL}/api/users/{{userId}}`,
    CREATE_USERS: `${API_URL}/api/users`,
    REPORT_TYPES: `${API_URL}/api/sites/{{siteKey}}/report-types`,
    ADD_ROLE: `${API_URL}/api/sites/{{siteKey}}/report-types/{{reportTypeId}}/roles/{{reportRole}}`,
    UNSUBSCRIBE_FROM_REPORT: `${API_URL}/api/sites/{{siteKey}}/report-types/{{reportTypeId}}/unsubscribe`,
    SUBSCRIBE_TO_REPORT: `${API_URL}/api/sites/{{siteKey}}/report-types/{{reportTypeId}}/subscribe`,
    REPORT_SUBSCRIPTIONS: `${API_URL}/api/sites/{{siteKey}}/report-types/subscriptions`,
    DAILY_SITE_CHARTS: `${API_URL}/api/sites/{{siteKey}}/charts/daily`,
    WEEKLY_SITE_CHARTS: `${API_URL}/api/sites/{{siteKey}}/charts/weekly`,
    SITE_FORECAST_SIGNAL: `${API_URL}/api/sites/{{siteKey}}/forecast/{{signalKey}}`,
    CHANGE_SIGNAL_LIMITS: `${API_URL}/api/sites/{{siteKey}}/signal-limits/{{limitTemplate}}`,
    USER_SITES : `${API_URL}/api/users/{{userId}}/sites`,
    SITE_ROLES : `${API_URL}/api/sites/{{siteKey}}/roles`,
    DELETE_SITE_FROM_USER : `${API_URL}/api/users/{{userId}}/sites/{{siteKey}}`,
    ADD_SITE_TO_USER : `${API_URL}/api/users/{{userId}}/sites/{{siteKey}}`,
    SITE_USERS : `${API_URL}/api/sites/{{siteKey}}/users`,
    DELETE_USER_FROM_SITE : `${API_URL}/api/sites/{{siteKey}}/users/{{userId}}`,
    ADD_USER_TO_SITE : `${API_URL}/api/sites/{{siteKey}}/users/{{userId}}`,
}