<?php
/**
 * Plugin Name: 交个神仙朋友 PWA
 * Plugin URI: https://divine-friend.app
 * Description: 集成交个神仙朋友PWA应用到WordPress网站中，支持短代码嵌入和自定义配置
 * Version: 1.0.0
 * Author: 交个神仙朋友团队
 * Author URI: https://divine-friend.app
 * License: GPL v2 or later
 * Text Domain: divine-friend-pwa
 * Domain Path: /languages
 * Network: false
 * 
 * @package DivineFriendPWA
 * @since 1.0.0
 */

// 防止直接访问
if (!defined('ABSPATH')) {
    exit;
}

// 定义插件常量
define('DIVINE_FRIEND_PWA_VERSION', '1.0.0');
define('DIVINE_FRIEND_PWA_PLUGIN_URL', plugin_dir_url(__FILE__));
define('DIVINE_FRIEND_PWA_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('DIVINE_FRIEND_PWA_ASSETS_URL', DIVINE_FRIEND_PWA_PLUGIN_URL . 'assets/');

/**
 * 交个神仙朋友 PWA 插件主类
 */
class DivineFriendPWAPlugin {
    
    /**
     * 插件实例
     */
    private static $instance = null;
    
    /**
     * 获取插件实例
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * 构造函数
     */
    private function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_shortcode('shenxian_pwa_app', array($this, 'render_pwa_shortcode'));
        add_action('wp_ajax_divine_friend_config', array($this, 'handle_ajax_config'));
        add_action('wp_ajax_nopriv_divine_friend_config', array($this, 'handle_ajax_config'));
        
        // 管理员功能
        if (is_admin()) {
            add_action('admin_menu', array($this, 'add_admin_menu'));
            add_action('admin_init', array($this, 'admin_init'));
        }
        
        // 插件激活和停用钩子
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }
    
    /**
     * 插件初始化
     */
    public function init() {
        // 加载文本域
        load_plugin_textdomain('divine-friend-pwa', false, dirname(plugin_basename(__FILE__)) . '/languages/');
        
        // 添加重写规则支持PWA路由
        add_rewrite_rule('^divine-friend-pwa/?$', 'index.php?divine_friend_pwa=1', 'top');
        add_rewrite_rule('^divine-friend-pwa/(.+)/?$', 'index.php?divine_friend_pwa=1&pwa_route=$matches[1]', 'top');
        
        // 添加查询变量
        add_filter('query_vars', array($this, 'add_query_vars'));
        
        // 处理PWA路由
        add_action('template_redirect', array($this, 'handle_pwa_routes'));
    }
    
    /**
     * 加载脚本和样式
     */
    public function enqueue_scripts() {
        // 注册PWA相关资源
        wp_register_script(
            'divine-friend-pwa-app',
            DIVINE_FRIEND_PWA_ASSETS_URL . 'assets/index-b61e2580.js',
            array(),
            DIVINE_FRIEND_PWA_VERSION,
            true
        );
        
        wp_register_style(
            'divine-friend-pwa-style',
            DIVINE_FRIEND_PWA_ASSETS_URL . 'assets/index-1aa60aba.css',
            array(),
            DIVINE_FRIEND_PWA_VERSION
        );
        
        // 本地化脚本
        wp_localize_script('divine-friend-pwa-app', 'divineFriendPWA', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('divine_friend_pwa_nonce'),
            'assetsUrl' => DIVINE_FRIEND_PWA_ASSETS_URL,
            'version' => DIVINE_FRIEND_PWA_VERSION,
            'isUserLoggedIn' => is_user_logged_in(),
            'currentUserId' => get_current_user_id(),
            'siteUrl' => home_url(),
            'restUrl' => rest_url(),
            'language' => get_locale()
        ));
    }
    
    /**
     * 短代码渲染函数
     */
    public function render_pwa_shortcode($atts) {
        // 默认属性
        $default_atts = array(
            'deity' => 'guanyin',
            'height' => '600px',
            'width' => '100%',
            'theme' => 'default',
            'mode' => 'embed',
            'show_header' => 'true',
            'show_footer' => 'true',
            'initial_page' => 'home',
            'api_key' => '',
            'custom_css' => ''
        );
        
        // 合并属性
        $atts = shortcode_atts($default_atts, $atts, 'shenxian_pwa_app');
        
        // 确保脚本和样式被加载
        wp_enqueue_script('divine-friend-pwa-app');
        wp_enqueue_style('divine-friend-pwa-style');
        
        // 生成唯一ID
        $container_id = 'shenxian-pwa-app-' . uniqid();
        
        // 构建配置对象
        $config = array(
            'deity' => sanitize_text_field($atts['deity']),
            'theme' => sanitize_text_field($atts['theme']),
            'mode' => sanitize_text_field($atts['mode']),
            'initialPage' => sanitize_text_field($atts['initial_page']),
            'showHeader' => $atts['show_header'] === 'true',
            'showFooter' => $atts['show_footer'] === 'true',
            'apiKey' => sanitize_text_field($atts['api_key']),
            'assetsUrl' => DIVINE_FRIEND_PWA_ASSETS_URL,
            'containerId' => $container_id
        );
        
        // 输出容器HTML
        ob_start();
        ?>
        <!-- 优雅的PWA容器 -->
        <div 
            id="<?php echo esc_attr($container_id); ?>" 
            class="shenxian-pwa-app-container shenxian-pwa-theme-<?php echo esc_attr($atts['theme']); ?>"
            style="
                width: <?php echo esc_attr($atts['width']); ?>; 
                min-height: <?php echo esc_attr($atts['height']); ?>; 
                position: relative; 
                overflow: hidden; 
                border-radius: 16px; 
                box-shadow: 
                    0 8px 32px rgba(0, 0, 0, 0.12),
                    0 2px 8px rgba(0, 0, 0, 0.08),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1);
                background: linear-gradient(135deg, #faf9f0 0%, #f5f4e8 100%);
                border: 1px solid rgba(212, 175, 55, 0.2);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                margin: 24px 0;
            "
            data-deity="<?php echo esc_attr($atts['deity']); ?>"
        >
            <!-- 华丽的加载状态 -->
            <div class="shenxian-pwa-app-loading" style="
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, 
                    rgba(245, 244, 232, 0.95) 0%, 
                    rgba(250, 249, 240, 0.98) 50%,
                    rgba(255, 253, 245, 0.95) 100%
                );
                backdrop-filter: blur(20px);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 999;
                transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            ">
                <!-- 禅意装饰背景 -->
                <div class="zen-decoration" style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    opacity: 0.1;
                    background-image: 
                        radial-gradient(circle at 25% 25%, rgba(212, 175, 55, 0.3) 0%, transparent 50%),
                        radial-gradient(circle at 75% 75%, rgba(212, 175, 55, 0.2) 0%, transparent 50%);
                    animation: zenFloat 8s ease-in-out infinite;
                "></div>
                
                <!-- 神仙形象 -->
                <div class="deity-loading-avatar" style="
                    font-size: 4rem; 
                    margin-bottom: 1.5rem; 
                    animation: gentleFloat 3s ease-in-out infinite;
                    text-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
                    position: relative;
                    z-index: 10;
                ">🙏</div>
                
                <!-- 优雅标题 -->
                <div class="loading-title" style="
                    color: #d4af37; 
                    font-size: 1.5rem; 
                    margin-bottom: 0.5rem;
                    font-family: 'Ma Shan Zheng', '楷体', serif;
                    font-weight: 400;
                    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    letter-spacing: 0.05em;
                ">交个神仙朋友</div>
                
                <!-- 诗意副标题 -->
                <div class="loading-subtitle" style="
                    color: rgba(44, 44, 44, 0.7); 
                    font-size: 1rem;
                    margin-bottom: 2rem;
                    font-family: 'Noto Serif SC', serif;
                    font-weight: 300;
                    text-align: center;
                    line-height: 1.6;
                    max-width: 300px;
                ">
                    <?php
                    $loading_texts = array(
                        'guanyin' => '慈悲之光正在照耀...',
                        'budongzun' => '智慧之剑正在觉醒...',
                        'dashizhi' => '般若光明正在绽放...',
                        'wenshu' => '文殊智慧正在开启...',
                        'xukong' => '虚空宝藏正在显现...',
                        'amitabha' => '净土莲花正在盛开...'
                    );
                    echo $loading_texts[$atts['deity']] ?? '东方智慧正在唤醒...';
                    ?>
                </div>
                
                <!-- 精美进度条 -->
                <div class="elegant-progress" style="
                    width: 200px;
                    height: 4px;
                    background: linear-gradient(90deg, 
                        rgba(212, 175, 55, 0.2) 0%,
                        rgba(212, 175, 55, 0.3) 50%,
                        rgba(212, 175, 55, 0.2) 100%
                    );
                    border-radius: 4px;
                    overflow: hidden;
                    position: relative;
                    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
                ">
                    <div class="progress-bar" style="
                        height: 100%;
                        background: linear-gradient(90deg, 
                            #d4af37 0%, 
                            #f4e4aa 50%, 
                            #d4af37 100%
                        );
                        width: 0%;
                        border-radius: 4px;
                        animation: elegantLoading 2.5s ease-in-out infinite;
                        box-shadow: 
                            0 0 8px rgba(212, 175, 55, 0.6),
                            inset 0 1px 0 rgba(255, 255, 255, 0.3);
                    "></div>
                </div>
                
                <!-- 禅意提示 -->
                <div class="zen-hint" style="
                    position: absolute;
                    bottom: 24px;
                    left: 50%;
                    transform: translateX(-50%);
                    color: rgba(44, 44, 44, 0.5);
                    font-size: 0.8rem;
                    font-style: italic;
                    animation: fadeInOut 4s ease-in-out infinite;
                ">
                    「心静如水，智慧自现」
                </div>
            </div>
            
            <!-- PWA内容容器 -->
            <div id="<?php echo esc_attr($container_id); ?>_app" 
                 class="shenxian-pwa-app-content"
                 style="
                     width: 100%; 
                     height: 100%; 
                     position: relative;
                     border-radius: 16px;
                     overflow: hidden;
                     opacity: 0;
                     transition: opacity 0.6s ease-in-out;
                 "></div>
        </div>
        
        <?php if (!empty($atts['custom_css'])): ?>
        <style>
            #<?php echo esc_attr($container_id); ?> {
                <?php echo wp_kses_post($atts['custom_css']); ?>
            }
        </style>
        <?php endif; ?>
        
        <style>
            /* 优雅的动画效果 */
            @keyframes gentleFloat {
                0%, 100% { 
                    transform: translateY(0px) scale(1); 
                }
                50% { 
                    transform: translateY(-8px) scale(1.02); 
                }
            }
            
            @keyframes elegantLoading {
                0% { 
                    width: 0%; 
                    transform: translateX(-50px);
                    opacity: 0.8;
                }
                50% { 
                    width: 60%; 
                    transform: translateX(0px);
                    opacity: 1;
                }
                100% { 
                    width: 100%; 
                    transform: translateX(0px);
                    opacity: 0.9;
                }
            }
            
            @keyframes zenFloat {
                0%, 100% { 
                    transform: translateY(0px) rotate(0deg); 
                    opacity: 0.1;
                }
                50% { 
                    transform: translateY(-3px) rotate(1deg); 
                    opacity: 0.15;
                }
            }
            
            @keyframes fadeInOut {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 0.7; }
            }
            
            @keyframes slideInFromBottom {
                0% {
                    transform: translateY(30px);
                    opacity: 0;
                }
                100% {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            /* 容器基础样式 */
            .shenxian-pwa-app-container {
                font-family: 'Noto Serif SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                isolation: isolate;
                will-change: transform;
            }
            
            .shenxian-pwa-app-container:hover {
                transform: translateY(-2px);
                box-shadow: 
                    0 12px 40px rgba(0, 0, 0, 0.15),
                    0 4px 12px rgba(0, 0, 0, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2);
            }
            
            /* 主题样式变体 */
            .shenxian-pwa-theme-zen {
                background: linear-gradient(135deg, #f8f7f0 0%, #f2f1e8 100%);
                border-color: rgba(212, 175, 55, 0.3);
            }
            
            .shenxian-pwa-theme-elegant {
                background: linear-gradient(135deg, #fdfcf5 0%, #f9f8f0 100%);
                border-color: rgba(212, 175, 55, 0.25);
                box-shadow: 
                    0 6px 24px rgba(0, 0, 0, 0.08),
                    0 1px 4px rgba(0, 0, 0, 0.04),
                    inset 0 1px 0 rgba(255, 255, 255, 0.15);
            }
            
            /* 加载完成后的平滑过渡 */
            .shenxian-pwa-app-loaded .shenxian-pwa-app-content {
                opacity: 1;
                animation: slideInFromBottom 0.8s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .shenxian-pwa-app-loaded .shenxian-pwa-app-loading {
                opacity: 0;
                transform: scale(0.95);
                pointer-events: none;
            }
            
            /* 响应式优化 */
            @media (max-width: 768px) {
                .shenxian-pwa-app-container {
                    border-radius: 12px;
                    margin: 16px 0;
                }
                
                .deity-loading-avatar {
                    font-size: 3rem !important;
                    margin-bottom: 1rem !important;
                }
                
                .loading-title {
                    font-size: 1.3rem !important;
                }
                
                .loading-subtitle {
                    font-size: 0.9rem !important;
                    margin-bottom: 1.5rem !important;
                }
                
                .elegant-progress {
                    width: 160px !important;
                }
            }
            
            /* 无障碍访问支持 */
            @media (prefers-reduced-motion: reduce) {
                .shenxian-pwa-app-container *,
                .shenxian-pwa-app-container *::before,
                .shenxian-pwa-app-container *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            }
            
            /* 高对比度支持 */
            @media (prefers-contrast: high) {
                .shenxian-pwa-app-container {
                    border-width: 2px;
                    border-color: #d4af37;
                }
                
                .loading-title {
                    color: #b8941f;
                    text-shadow: none;
                }
            }
        </style>
        
        <script>
            (function() {
                var containerId = '<?php echo esc_js($container_id); ?>';
                var appContainerId = containerId + '_app';
                var config = <?php echo wp_json_encode($config); ?>;
                
                // 优雅的PWA初始化流程
                function initializeDivineFriendPWA() {
                    var container = document.getElementById(containerId);
                    var appContainer = document.getElementById(appContainerId);
                    var loadingElement = container.querySelector('.shenxian-pwa-app-loading');
                    
                    // 渐进式加载体验
                    function completeLoading() {
                        // 添加加载完成的类
                        container.classList.add('shenxian-pwa-app-loaded');
                        
                        // 延迟隐藏加载屏幕，确保动画完成
                        setTimeout(function() {
                            if (loadingElement) {
                                loadingElement.style.display = 'none';
                            }
                        }, 800);
                    }
                    
                    // 尝试直接渲染React应用
                    if (appContainer && window.React && window.DivineFriendApp) {
                        try {
                            // 初始化React应用
                            window.DivineFriendApp.render(appContainer, config);
                            
                            // 应用加载成功
                            setTimeout(completeLoading, 1200);
                            
                        } catch (error) {
                            console.warn('Direct React rendering failed, falling back to iframe:', error);
                            fallbackToIframe();
                        }
                    } else {
                        // 回退到iframe模式
                        fallbackToIframe();
                    }
                    
                    function fallbackToIframe() {
                        if (appContainer) {
                            // 创建优雅的iframe
                            var iframe = document.createElement('iframe');
                            // 使用专门的聊天页面，带参数
                            var iframeUrl = config.assetsUrl + 'chat.html';
                            if (config.deity) {
                                iframeUrl += '?deity=' + encodeURIComponent(config.deity);
                            }
                            iframe.src = iframeUrl;
                            iframe.style.cssText = 'width: 100%; height: 100%; border: none; border-radius: 16px; background: transparent;';
                            iframe.title = '交个神仙朋友';
                            iframe.allow = 'microphone; camera; geolocation; notifications';
                            iframe.loading = 'lazy';
                            
                            // iframe加载完成事件
                            iframe.onload = function() {
                                setTimeout(completeLoading, 800);
                                
                                // 尝试向iframe发送配置
                                try {
                                    iframe.contentWindow.postMessage({
                                        type: 'DIVINE_FRIEND_CONFIG',
                                        config: config
                                    }, '*');
                                } catch (e) {
                                    console.warn('Failed to send config to iframe:', e);
                                }
                            };
                            
                            // iframe加载失败处理
                            iframe.onerror = function() {
                                console.error('Failed to load Divine Friend PWA iframe');
                                showErrorState();
                            };
                            
                            appContainer.appendChild(iframe);
                            
                            // 备用超时处理
                            setTimeout(function() {
                                if (loadingElement && loadingElement.style.display !== 'none') {
                                    completeLoading();
                                }
                            }, 5000);
                        }
                    }
                    
                    function showErrorState() {
                        if (appContainer) {
                            appContainer.innerHTML = 
                                '<div style="' +
                                    'display: flex; flex-direction: column; justify-content: center; align-items: center; ' +
                                    'height: 100%; padding: 2rem; text-align: center; color: #666; ' +
                                    'font-family: \'Noto Serif SC\', serif;' +
                                '">' +
                                    '<div style="font-size: 2rem; margin-bottom: 1rem;">😔</div>' +
                                    '<div style="font-size: 1.1rem; margin-bottom: 0.5rem; color: #d4af37;">暂时无法连接</div>' +
                                    '<div style="font-size: 0.9rem; opacity: 0.7;">请稍后再试，或检查网络连接</div>' +
                                    '<button onclick="location.reload()" style="' +
                                        'margin-top: 1rem; padding: 8px 16px; background: #d4af37; color: white; ' +
                                        'border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem;' +
                                    '">重新加载</button>' +
                                '</div>';
                        }
                        completeLoading();
                    }
                }
                
                // 检查脚本是否加载完成
                if (document.readyState === 'complete') {
                    setTimeout(initializeDivineFriendPWA, 500);
                } else {
                    window.addEventListener('load', function() {
                        setTimeout(initializeDivineFriendPWA, 500);
                    });
                }
                
                // 监听来自PWA的消息
                window.addEventListener('message', function(event) {
                    if (event.data && event.data.type === 'DIVINE_FRIEND_RESIZE') {
                        var container = document.getElementById(containerId);
                        if (container && event.data.height) {
                            container.style.height = event.data.height + 'px';
                        }
                    }
                });
            })();
        </script>
        <?php
        return ob_get_clean();
    }
    
    /**
     * 添加查询变量
     */
    public function add_query_vars($vars) {
        $vars[] = 'divine_friend_pwa';
        $vars[] = 'pwa_route';
        return $vars;
    }
    
    /**
     * 处理PWA路由
     */
    public function handle_pwa_routes() {
        if (get_query_var('divine_friend_pwa')) {
            // 设置正确的Content-Type
            header('Content-Type: text/html; charset=utf-8');
            
            // 输出PWA页面
            include DIVINE_FRIEND_PWA_PLUGIN_PATH . 'assets/index.html';
            exit;
        }
    }
    
    /**
     * 处理AJAX配置请求
     */
    public function handle_ajax_config() {
        // 验证nonce
        if (!wp_verify_nonce($_POST['nonce'], 'divine_friend_pwa_nonce')) {
            wp_die('Security check failed');
        }
        
        $config = array(
            'assetsUrl' => DIVINE_FRIEND_PWA_ASSETS_URL,
            'version' => DIVINE_FRIEND_PWA_VERSION,
            'isUserLoggedIn' => is_user_logged_in(),
            'currentUserId' => get_current_user_id(),
            'siteUrl' => home_url(),
            'restUrl' => rest_url(),
            'language' => get_locale()
        );
        
        wp_send_json_success($config);
    }
    
    /**
     * 添加管理员菜单
     */
    public function add_admin_menu() {
        add_options_page(
            __('交个神仙朋友 PWA 设置', 'divine-friend-pwa'),
            __('神仙朋友 PWA', 'divine-friend-pwa'),
            'manage_options',
            'divine-friend-pwa',
            array($this, 'admin_page')
        );
    }
    
    /**
     * 管理员页面初始化
     */
    public function admin_init() {
        register_setting('divine_friend_pwa_settings', 'divine_friend_pwa_options');
        
        add_settings_section(
            'divine_friend_pwa_main',
            __('基本设置', 'divine-friend-pwa'),
            array($this, 'settings_section_callback'),
            'divine-friend-pwa'
        );
        
        add_settings_field(
            'default_deity',
            __('默认神仙', 'divine-friend-pwa'),
            array($this, 'deity_field_callback'),
            'divine-friend-pwa',
            'divine_friend_pwa_main'
        );
        
        add_settings_field(
            'api_key',
            __('API密钥', 'divine-friend-pwa'),
            array($this, 'api_key_field_callback'),
            'divine-friend-pwa',
            'divine_friend_pwa_main'
        );
    }
    
    /**
     * 管理员页面
     */
    public function admin_page() {
        ?>
        <div class="wrap">
            <h1><?php _e('交个神仙朋友 PWA 设置', 'divine-friend-pwa'); ?></h1>
            
            <div class="notice notice-info">
                <p><strong><?php _e('短代码使用方法:', 'divine-friend-pwa'); ?></strong></p>
                <p><code>[shenxian_pwa_app deity="guanyin" height="600px"]</code></p>
                <p><?php _e('支持的参数: deity, height, width, theme, mode, show_header, show_footer, initial_page', 'divine-friend-pwa'); ?></p>
            </div>
            
            <form method="post" action="options.php">
                <?php
                settings_fields('divine_friend_pwa_settings');
                do_settings_sections('divine-friend-pwa');
                submit_button();
                ?>
            </form>
            
            <div class="card">
                <h2><?php _e('可用神仙', 'divine-friend-pwa'); ?></h2>
                <ul>
                    <li><strong>guanyin</strong> - <?php _e('观音菩萨 (默认)', 'divine-friend-pwa'); ?></li>
                    <li><strong>budongzun</strong> - <?php _e('不动尊菩萨', 'divine-friend-pwa'); ?></li>
                    <li><strong>dashizhi</strong> - <?php _e('大势至菩萨', 'divine-friend-pwa'); ?></li>
                    <li><strong>wenshu</strong> - <?php _e('文殊菩萨', 'divine-friend-pwa'); ?></li>
                    <li><strong>xukong</strong> - <?php _e('虚空藏菩萨', 'divine-friend-pwa'); ?></li>
                    <li><strong>amitabha</strong> - <?php _e('阿弥陀佛', 'divine-friend-pwa'); ?></li>
                </ul>
            </div>
        </div>
        <?php
    }
    
    /**
     * 设置部分回调
     */
    public function settings_section_callback() {
        echo '<p>' . __('配置交个神仙朋友 PWA 的基本设置。', 'divine-friend-pwa') . '</p>';
    }
    
    /**
     * 神仙字段回调
     */
    public function deity_field_callback() {
        $options = get_option('divine_friend_pwa_options');
        $deity = isset($options['default_deity']) ? $options['default_deity'] : 'guanyin';
        ?>
        <select name="divine_friend_pwa_options[default_deity]">
            <option value="guanyin" <?php selected($deity, 'guanyin'); ?>><?php _e('观音菩萨', 'divine-friend-pwa'); ?></option>
            <option value="budongzun" <?php selected($deity, 'budongzun'); ?>><?php _e('不动尊菩萨', 'divine-friend-pwa'); ?></option>
            <option value="dashizhi" <?php selected($deity, 'dashizhi'); ?>><?php _e('大势至菩萨', 'divine-friend-pwa'); ?></option>
            <option value="wenshu" <?php selected($deity, 'wenshu'); ?>><?php _e('文殊菩萨', 'divine-friend-pwa'); ?></option>
            <option value="xukong" <?php selected($deity, 'xukong'); ?>><?php _e('虚空藏菩萨', 'divine-friend-pwa'); ?></option>
            <option value="amitabha" <?php selected($deity, 'amitabha'); ?>><?php _e('阿弥陀佛', 'divine-friend-pwa'); ?></option>
        </select>
        <?php
    }
    
    /**
     * API密钥字段回调
     */
    public function api_key_field_callback() {
        $options = get_option('divine_friend_pwa_options');
        $api_key = isset($options['api_key']) ? $options['api_key'] : '';
        ?>
        <input type="text" name="divine_friend_pwa_options[api_key]" value="<?php echo esc_attr($api_key); ?>" class="regular-text" />
        <p class="description"><?php _e('AI服务的API密钥（可选）', 'divine-friend-pwa'); ?></p>
        <?php
    }
    
    /**
     * 插件激活
     */
    public function activate() {
        // 刷新重写规则
        flush_rewrite_rules();
        
        // 设置默认选项
        $default_options = array(
            'default_deity' => 'guanyin',
            'api_key' => ''
        );
        
        if (!get_option('divine_friend_pwa_options')) {
            add_option('divine_friend_pwa_options', $default_options);
        }
    }
    
    /**
     * 插件停用
     */
    public function deactivate() {
        // 刷新重写规则
        flush_rewrite_rules();
    }
}

// 初始化插件
DivineFriendPWAPlugin::get_instance();

/**
 * 获取插件版本
 */
function divine_friend_pwa_get_version() {
    return DIVINE_FRIEND_PWA_VERSION;
}

/**
 * 获取资源URL
 */
function divine_friend_pwa_get_assets_url() {
    return DIVINE_FRIEND_PWA_ASSETS_URL;
}