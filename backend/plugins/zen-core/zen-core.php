<?php
/**
 * Plugin Name: Zen Core - 交个神仙朋友核心插件
 * Plugin URI: https://divine-friend.com
 * Description: 交个神仙朋友PWA应用的核心功能插件，提供用户管理、运势分析、AI集成等功能
 * Version: 1.0.0
 * Author: Divine Friend Team
 * License: GPL v2 or later
 * Text Domain: zen-core
 * Domain Path: /languages
 */

// 防止直接访问
if (!defined('ABSPATH')) {
    exit;
}

// 定义插件常量
define('ZEN_CORE_VERSION', '1.0.0');
define('ZEN_CORE_PLUGIN_URL', plugin_dir_url(__FILE__));
define('ZEN_CORE_PLUGIN_PATH', plugin_dir_path(__FILE__));

// 主插件类
class ZenCore {
    
    public function __construct() {
        $this->init_hooks();
    }
    
    private function init_hooks() {
        add_action('init', array($this, 'init'));
        add_action('rest_api_init', array($this, 'register_api_routes'));
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }
    
    public function init() {
        $this->load_textdomain();
        $this->register_post_types();
        $this->register_taxonomies();
    }
    
    public function register_api_routes() {
        // 注册REST API路由
        require_once ZEN_CORE_PLUGIN_PATH . 'includes/api/class-zen-api.php';
        new Zen_API();
    }
    
    private function load_textdomain() {
        load_plugin_textdomain('zen-core', false, dirname(plugin_basename(__FILE__)) . '/languages');
    }
    
    private function register_post_types() {
        // 注册自定义文章类型
        require_once ZEN_CORE_PLUGIN_PATH . 'includes/class-zen-post-types.php';
        new Zen_Post_Types();
    }
    
    private function register_taxonomies() {
        // 注册自定义分类法
        require_once ZEN_CORE_PLUGIN_PATH . 'includes/class-zen-taxonomies.php';
        new Zen_Taxonomies();
    }
    
    public function activate() {
        // 激活时创建数据库表
        require_once ZEN_CORE_PLUGIN_PATH . 'includes/class-zen-activator.php';
        Zen_Activator::activate();
    }
    
    public function deactivate() {
        // 停用时清理
        require_once ZEN_CORE_PLUGIN_PATH . 'includes/class-zen-deactivator.php';
        Zen_Deactivator::deactivate();
    }
}

// 初始化插件
new ZenCore();
