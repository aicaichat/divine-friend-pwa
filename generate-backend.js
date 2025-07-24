#!/usr/bin/env node

/**
 * 交个神仙朋友 PWA - WordPress后端代码生成器
 * Divine Friend PWA - WordPress Backend Generator
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// WordPress 插件模板
const pluginTemplates = {
  // 主插件文件
  mainPlugin: (name, description) => `<?php
/**
 * Plugin Name: ${name}
 * Plugin URI: https://divine-friend.com
 * Description: ${description}
 * Version: 1.0.0
 * Author: Divine Friend Team
 * License: GPL v2 or later
 * Text Domain: zen-${name.toLowerCase().replace(/\s+/g, '-')}
 * Domain Path: /languages
 */

// 防止直接访问
if (!defined('ABSPATH')) {
    exit;
}

// 定义插件常量
define('ZEN_${name.toUpperCase().replace(/\s+/g, '_')}_VERSION', '1.0.0');
define('ZEN_${name.toUpperCase().replace(/\s+/g, '_')}_PLUGIN_URL', plugin_dir_url(__FILE__));
define('ZEN_${name.toUpperCase().replace(/\s+/g, '_')}_PLUGIN_PATH', plugin_dir_path(__FILE__));

/**
 * 主插件类
 */
class Zen${name.replace(/\s+/g, '')} {
    
    /**
     * 构造函数
     */
    public function __construct() {
        $this->init_hooks();
    }
    
    /**
     * 初始化钩子
     */
    private function init_hooks() {
        add_action('init', array($this, 'init'));
        add_action('rest_api_init', array($this, 'register_api_routes'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
        
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
        register_uninstall_hook(__FILE__, array('Zen${name.replace(/\s+/g, '')}', 'uninstall'));
    }
    
    /**
     * 插件初始化
     */
    public function init() {
        $this->load_textdomain();
        $this->register_post_types();
        $this->register_taxonomies();
        $this->init_admin();
    }
    
    /**
     * 注册REST API路由
     */
    public function register_api_routes() {
        require_once ZEN_${name.toUpperCase().replace(/\s+/g, '_')}_PLUGIN_PATH . 'includes/api/class-zen-${name.toLowerCase().replace(/\s+/g, '-')}-api.php';
        new Zen_${name.replace(/\s+/g, '')}_API();
    }
    
    /**
     * 加载前端脚本
     */
    public function enqueue_scripts() {
        wp_enqueue_script(
            'zen-${name.toLowerCase().replace(/\s+/g, '-')}-frontend',
            ZEN_${name.toUpperCase().replace(/\s+/g, '_')}_PLUGIN_URL . 'assets/js/frontend.js',
            array('jquery'),
            ZEN_${name.toUpperCase().replace(/\s+/g, '_')}_VERSION,
            true
        );
        
        wp_enqueue_style(
            'zen-${name.toLowerCase().replace(/\s+/g, '-')}-frontend',
            ZEN_${name.toUpperCase().replace(/\s+/g, '_')}_PLUGIN_URL . 'assets/css/frontend.css',
            array(),
            ZEN_${name.toUpperCase().replace(/\s+/g, '_')}_VERSION
        );
        
        // 本地化脚本
        wp_localize_script(
            'zen-${name.toLowerCase().replace(/\s+/g, '-')}-frontend',
            'zen${name.replace(/\s+/g, '')}Ajax',
            array(
                'ajaxurl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('zen_${name.toLowerCase().replace(/\s+/g, '_')}_nonce'),
                'api_url' => rest_url('zen/${name.toLowerCase().replace(/\s+/g, '-')}/v1/'),
            )
        );
    }
    
    /**
     * 加载后台脚本
     */
    public function admin_enqueue_scripts($hook) {
        wp_enqueue_script(
            'zen-${name.toLowerCase().replace(/\s+/g, '-')}-admin',
            ZEN_${name.toUpperCase().replace(/\s+/g, '_')}_PLUGIN_URL . 'assets/js/admin.js',
            array('jquery'),
            ZEN_${name.toUpperCase().replace(/\s+/g, '_')}_VERSION,
            true
        );
        
        wp_enqueue_style(
            'zen-${name.toLowerCase().replace(/\s+/g, '-')}-admin',
            ZEN_${name.toUpperCase().replace(/\s+/g, '_')}_PLUGIN_URL . 'assets/css/admin.css',
            array(),
            ZEN_${name.toUpperCase().replace(/\s+/g, '_')}_VERSION
        );
    }
    
    /**
     * 加载语言文件
     */
    private function load_textdomain() {
        load_plugin_textdomain(
            'zen-${name.toLowerCase().replace(/\s+/g, '-')}',
            false,
            dirname(plugin_basename(__FILE__)) . '/languages'
        );
    }
    
    /**
     * 注册自定义文章类型
     */
    private function register_post_types() {
        require_once ZEN_${name.toUpperCase().replace(/\s+/g, '_')}_PLUGIN_PATH . 'includes/class-zen-post-types.php';
        new Zen_Post_Types();
    }
    
    /**
     * 注册自定义分类法
     */
    private function register_taxonomies() {
        require_once ZEN_${name.toUpperCase().replace(/\s+/g, '_')}_PLUGIN_PATH . 'includes/class-zen-taxonomies.php';
        new Zen_Taxonomies();
    }
    
    /**
     * 初始化管理界面
     */
    private function init_admin() {
        if (is_admin()) {
            require_once ZEN_${name.toUpperCase().replace(/\s+/g, '_')}_PLUGIN_PATH . 'admin/class-zen-admin.php';
            new Zen_Admin();
        }
    }
    
    /**
     * 插件激活
     */
    public function activate() {
        require_once ZEN_${name.toUpperCase().replace(/\s+/g, '_')}_PLUGIN_PATH . 'includes/class-zen-activator.php';
        Zen_Activator::activate();
        
        // 刷新重写规则
        flush_rewrite_rules();
    }
    
    /**
     * 插件停用
     */
    public function deactivate() {
        require_once ZEN_${name.toUpperCase().replace(/\s+/g, '_')}_PLUGIN_PATH . 'includes/class-zen-deactivator.php';
        Zen_Deactivator::deactivate();
        
        // 刷新重写规则
        flush_rewrite_rules();
    }
    
    /**
     * 插件卸载
     */
    public static function uninstall() {
        require_once ZEN_${name.toUpperCase().replace(/\s+/g, '_')}_PLUGIN_PATH . 'includes/class-zen-uninstaller.php';
        Zen_Uninstaller::uninstall();
    }
}

// 初始化插件
new Zen${name.replace(/\s+/g, '')}();`,

  // API控制器
  apiController: (name, description) => `<?php
/**
 * ${name} REST API 控制器
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * ${name} API 类
 */
class Zen_${name.replace(/\s+/g, '')}_API extends WP_REST_Controller {

    /**
     * 命名空间
     */
    protected $namespace = 'zen/${name.toLowerCase().replace(/\s+/g, '-')}/v1';

    /**
     * 资源名称
     */
    protected $rest_base = '${name.toLowerCase().replace(/\s+/g, '-')}';

    /**
     * 构造函数
     */
    public function __construct() {
        $this->register_routes();
    }

    /**
     * 注册路由
     */
    public function register_routes() {
        // 获取列表
        register_rest_route($this->namespace, '/' . $this->rest_base, array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_items'),
                'permission_callback' => array($this, 'get_items_permissions_check'),
                'args' => $this->get_collection_params(),
            ),
            array(
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => array($this, 'create_item'),
                'permission_callback' => array($this, 'create_item_permissions_check'),
                'args' => $this->get_endpoint_args_for_item_schema(WP_REST_Server::CREATABLE),
            ),
        ));

        // 获取单个项目
        register_rest_route($this->namespace, '/' . $this->rest_base . '/(?P<id>[\\d]+)', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_item'),
                'permission_callback' => array($this, 'get_item_permissions_check'),
                'args' => array(
                    'id' => array(
                        'description' => __('项目ID', 'zen-${name.toLowerCase().replace(/\s+/g, '-')}'),
                        'type' => 'integer',
                    ),
                ),
            ),
            array(
                'methods' => WP_REST_Server::EDITABLE,
                'callback' => array($this, 'update_item'),
                'permission_callback' => array($this, 'update_item_permissions_check'),
                'args' => $this->get_endpoint_args_for_item_schema(WP_REST_Server::EDITABLE),
            ),
            array(
                'methods' => WP_REST_Server::DELETABLE,
                'callback' => array($this, 'delete_item'),
                'permission_callback' => array($this, 'delete_item_permissions_check'),
            ),
        ));

        // 获取模式
        register_rest_route($this->namespace, '/' . $this->rest_base . '/schema', array(
            'methods' => WP_REST_Server::READABLE,
            'callback' => array($this, 'get_public_item_schema'),
        ));
    }

    /**
     * 获取项目列表
     */
    public function get_items($request) {
        $args = array();
        $args['post_type'] = '${name.toLowerCase().replace(/\s+/g, '_')}';
        $args['post_status'] = 'publish';

        // 分页参数
        $args['posts_per_page'] = $request['per_page'];
        $args['paged'] = $request['page'];

        // 搜索参数
        if (!empty($request['search'])) {
            $args['s'] = $request['search'];
        }

        $posts = get_posts($args);
        $data = array();

        foreach ($posts as $post) {
            $response = $this->prepare_item_for_response($post, $request);
            $data[] = $this->prepare_response_for_collection($response);
        }

        return new WP_REST_Response($data, 200);
    }

    /**
     * 获取单个项目
     */
    public function get_item($request) {
        $id = (int) $request['id'];
        $post = get_post($id);

        if (empty($post) || $post->post_type !== '${name.toLowerCase().replace(/\s+/g, '_')}') {
            return new WP_Error('rest_post_invalid_id', __('无效的项目ID', 'zen-${name.toLowerCase().replace(/\s+/g, '-')}'), array('status' => 404));
        }

        $response = $this->prepare_item_for_response($post, $request);
        return $response;
    }

    /**
     * 创建项目
     */
    public function create_item($request) {
        if (!empty($request['id'])) {
            return new WP_Error('rest_post_exists', __('无法创建已存在的项目', 'zen-${name.toLowerCase().replace(/\s+/g, '-')}'), array('status' => 400));
        }

        $prepared_post = $this->prepare_item_for_database($request);

        if (is_wp_error($prepared_post)) {
            return $prepared_post;
        }

        $post_id = wp_insert_post($prepared_post, true);

        if (is_wp_error($post_id)) {
            return $post_id;
        }

        $post = get_post($post_id);
        $response = $this->prepare_item_for_response($post, $request);

        return new WP_REST_Response($response->get_data(), 201);
    }

    /**
     * 更新项目
     */
    public function update_item($request) {
        $id = (int) $request['id'];
        $post = get_post($id);

        if (empty($post) || $post->post_type !== '${name.toLowerCase().replace(/\s+/g, '_')}') {
            return new WP_Error('rest_post_invalid_id', __('无效的项目ID', 'zen-${name.toLowerCase().replace(/\s+/g, '-')}'), array('status' => 404));
        }

        $prepared_post = $this->prepare_item_for_database($request);
        $prepared_post['ID'] = $id;

        $post_id = wp_update_post($prepared_post, true);

        if (is_wp_error($post_id)) {
            return $post_id;
        }

        $post = get_post($post_id);
        $response = $this->prepare_item_for_response($post, $request);

        return $response;
    }

    /**
     * 删除项目
     */
    public function delete_item($request) {
        $id = (int) $request['id'];
        $post = get_post($id);

        if (empty($post) || $post->post_type !== '${name.toLowerCase().replace(/\s+/g, '_')}') {
            return new WP_Error('rest_post_invalid_id', __('无效的项目ID', 'zen-${name.toLowerCase().replace(/\s+/g, '-')}'), array('status' => 404));
        }

        $supports_trash = EMPTY_TRASH_DAYS > 0;

        $request->set_param('context', 'edit');
        $response = $this->prepare_item_for_response($post, $request);

        $result = wp_delete_post($id, !$supports_trash);

        if (!$result) {
            return new WP_Error('rest_cannot_delete', __('项目无法删除', 'zen-${name.toLowerCase().replace(/\s+/g, '-')}'), array('status' => 500));
        }

        return $response;
    }

    /**
     * 准备响应数据
     */
    public function prepare_item_for_response($post, $request) {
        $data = array(
            'id' => $post->ID,
            'title' => $post->post_title,
            'content' => $post->post_content,
            'status' => $post->post_status,
            'date' => mysql_to_rfc3339($post->post_date),
            'modified' => mysql_to_rfc3339($post->post_modified),
            'meta' => get_post_meta($post->ID),
        );

        $context = !empty($request['context']) ? $request['context'] : 'view';
        $data = $this->add_additional_fields_to_object($data, $request);
        $data = $this->filter_response_by_context($data, $context);

        $response = rest_ensure_response($data);
        $response->add_links($this->prepare_links($post));

        return $response;
    }

    /**
     * 准备数据库数据
     */
    protected function prepare_item_for_database($request) {
        $prepared_post = array();

        if (isset($request['title'])) {
            $prepared_post['post_title'] = $request['title'];
        }

        if (isset($request['content'])) {
            $prepared_post['post_content'] = $request['content'];
        }

        if (isset($request['status'])) {
            $prepared_post['post_status'] = $request['status'];
        }

        $prepared_post['post_type'] = '${name.toLowerCase().replace(/\s+/g, '_')}';

        return $prepared_post;
    }

    /**
     * 权限检查 - 获取列表
     */
    public function get_items_permissions_check($request) {
        return true; // 公开访问
    }

    /**
     * 权限检查 - 获取单项
     */
    public function get_item_permissions_check($request) {
        return true; // 公开访问
    }

    /**
     * 权限检查 - 创建项目
     */
    public function create_item_permissions_check($request) {
        return current_user_can('edit_posts');
    }

    /**
     * 权限检查 - 更新项目
     */
    public function update_item_permissions_check($request) {
        $post = get_post((int) $request['id']);
        return current_user_can('edit_post', $post->ID);
    }

    /**
     * 权限检查 - 删除项目
     */
    public function delete_item_permissions_check($request) {
        $post = get_post((int) $request['id']);
        return current_user_can('delete_post', $post->ID);
    }

    /**
     * 获取项目模式
     */
    public function get_item_schema() {
        $schema = array(
            '$schema' => 'http://json-schema.org/draft-04/schema#',
            'title' => '${name}',
            'type' => 'object',
            'properties' => array(
                'id' => array(
                    'description' => __('项目唯一标识符', 'zen-${name.toLowerCase().replace(/\s+/g, '-')}'),
                    'type' => 'integer',
                    'context' => array('view', 'edit', 'embed'),
                    'readonly' => true,
                ),
                'title' => array(
                    'description' => __('项目标题', 'zen-${name.toLowerCase().replace(/\s+/g, '-')}'),
                    'type' => 'string',
                    'context' => array('view', 'edit', 'embed'),
                ),
                'content' => array(
                    'description' => __('项目内容', 'zen-${name.toLowerCase().replace(/\s+/g, '-')}'),
                    'type' => 'string',
                    'context' => array('view', 'edit'),
                ),
                'status' => array(
                    'description' => __('项目状态', 'zen-${name.toLowerCase().replace(/\s+/g, '-')}'),
                    'type' => 'string',
                    'enum' => array('publish', 'draft', 'private'),
                    'context' => array('view', 'edit'),
                ),
            ),
        );

        return $this->add_additional_fields_schema($schema);
    }
}`,

  // 数据库激活器
  activator: (name) => `<?php
/**
 * ${name} 插件激活器
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * 插件激活类
 */
class Zen_Activator {

    /**
     * 激活插件
     */
    public static function activate() {
        global $wpdb;

        // 创建自定义数据表
        self::create_tables();
        
        // 设置默认选项
        self::set_default_options();
        
        // 创建必要的页面
        self::create_pages();
        
        // 设置用户角色和权限
        self::setup_roles_and_capabilities();
        
        // 清除缓存
        wp_cache_flush();
    }

    /**
     * 创建数据表
     */
    private static function create_tables() {
        global $wpdb;

        $charset_collate = $wpdb->get_charset_collate();

        // 用户扩展信息表
        $table_name = $wpdb->prefix . 'zen_user_profiles';
        $sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) UNSIGNED NOT NULL,
            birth_year varchar(4) DEFAULT '',
            birth_month varchar(2) DEFAULT '',
            birth_day varchar(2) DEFAULT '',
            birth_hour varchar(2) DEFAULT '',
            gender varchar(1) DEFAULT 'M',
            lunar_calendar tinyint(1) DEFAULT 0,
            bazi_data text DEFAULT '',
            fortune_elements text DEFAULT '',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY user_id (user_id)
        ) $charset_collate;";

        // 运势记录表
        $table_name_fortune = $wpdb->prefix . 'zen_fortune_records';
        $sql_fortune = "CREATE TABLE $table_name_fortune (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) UNSIGNED NOT NULL,
            fortune_date date NOT NULL,
            fortune_type varchar(20) DEFAULT 'daily',
            fortune_score tinyint(3) DEFAULT 0,
            fortune_content text DEFAULT '',
            advice_content text DEFAULT '',
            elements_analysis text DEFAULT '',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_date (user_id, fortune_date),
            KEY fortune_type (fortune_type)
        ) $charset_collate;";

        // 祝福消息表
        $table_name_blessings = $wpdb->prefix . 'zen_blessings';
        $sql_blessings = "CREATE TABLE $table_name_blessings (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            sender_id bigint(20) UNSIGNED NOT NULL,
            receiver_id bigint(20) UNSIGNED NOT NULL,
            blessing_type varchar(20) DEFAULT 'general',
            blessing_content text NOT NULL,
            is_read tinyint(1) DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            read_at datetime NULL,
            PRIMARY KEY (id),
            KEY sender_id (sender_id),
            KEY receiver_id (receiver_id),
            KEY blessing_type (blessing_type)
        ) $charset_collate;";

        // 求卦记录表
        $table_name_divination = $wpdb->prefix . 'zen_divination_records';
        $sql_divination = "CREATE TABLE $table_name_divination (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) UNSIGNED NOT NULL,
            question text NOT NULL,
            hexagram_data text NOT NULL,
            interpretation text DEFAULT '',
            divination_date datetime DEFAULT CURRENT_TIMESTAMP,
            is_public tinyint(1) DEFAULT 0,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY divination_date (divination_date)
        ) $charset_collate;";

        // NFC手串表
        $table_name_bracelets = $wpdb->prefix . 'zen_nfc_bracelets';
        $sql_bracelets = "CREATE TABLE $table_name_bracelets (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            nfc_uid varchar(32) UNIQUE NOT NULL,
            product_id bigint(20) UNSIGNED DEFAULT NULL,
            owner_id bigint(20) UNSIGNED DEFAULT NULL,
            bracelet_type varchar(50) DEFAULT '',
            material varchar(50) DEFAULT '',
            blessing_info text DEFAULT '',
            blessing_date datetime DEFAULT NULL,
            verification_status varchar(20) DEFAULT 'pending',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY nfc_uid (nfc_uid),
            KEY owner_id (owner_id),
            KEY product_id (product_id)
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
        dbDelta($sql_fortune);
        dbDelta($sql_blessings);
        dbDelta($sql_divination);
        dbDelta($sql_bracelets);
    }

    /**
     * 设置默认选项
     */
    private static function set_default_options() {
        $default_options = array(
            'zen_ai_provider' => 'openai',
            'zen_ai_model' => 'gpt-4',
            'zen_fortune_cache_time' => 3600, // 1小时
            'zen_blessing_daily_limit' => 10,
            'zen_divination_daily_limit' => 3,
            'zen_nfc_verification_required' => true,
            'zen_debug_mode' => false,
        );

        foreach ($default_options as $key => $value) {
            if (get_option($key) === false) {
                add_option($key, $value);
            }
        }
    }

    /**
     * 创建必要的页面
     */
    private static function create_pages() {
        $pages = array(
            'zen-home' => array(
                'title' => '交个神仙朋友',
                'content' => '[zen_pwa_app]',
                'template' => 'page-zen-pwa.php'
            ),
            'zen-privacy' => array(
                'title' => '隐私政策',
                'content' => '隐私政策内容...',
            ),
            'zen-terms' => array(
                'title' => '服务条款',
                'content' => '服务条款内容...',
            ),
        );

        foreach ($pages as $slug => $page_data) {
            $existing_page = get_page_by_path($slug);
            
            if (!$existing_page) {
                $page_id = wp_insert_post(array(
                    'post_title' => $page_data['title'],
                    'post_content' => $page_data['content'],
                    'post_status' => 'publish',
                    'post_type' => 'page',
                    'post_name' => $slug,
                ));

                if (isset($page_data['template'])) {
                    update_post_meta($page_id, '_wp_page_template', $page_data['template']);
                }
            }
        }
    }

    /**
     * 设置用户角色和权限
     */
    private static function setup_roles_and_capabilities() {
        // 添加自定义权限到管理员角色
        $admin_role = get_role('administrator');
        if ($admin_role) {
            $admin_role->add_cap('manage_zen_settings');
            $admin_role->add_cap('manage_zen_users');
            $admin_role->add_cap('manage_zen_nfc');
            $admin_role->add_cap('view_zen_analytics');
        }

        // 创建神仙朋友管理员角色
        add_role('zen_admin', '神仙朋友管理员', array(
            'read' => true,
            'edit_posts' => true,
            'manage_zen_settings' => true,
            'manage_zen_users' => true,
            'manage_zen_nfc' => true,
            'view_zen_analytics' => true,
        ));

        // 创建命理师角色
        add_role('fortune_teller', '命理师', array(
            'read' => true,
            'edit_posts' => true,
            'manage_fortune_analysis' => true,
            'view_user_bazi' => true,
        ));
    }
}`,

  // 自定义文章类型
  postTypes: (name) => `<?php
/**
 * 自定义文章类型注册
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * 自定义文章类型类
 */
class Zen_Post_Types {

    /**
     * 构造函数
     */
    public function __construct() {
        add_action('init', array($this, 'register_post_types'));
    }

    /**
     * 注册自定义文章类型
     */
    public function register_post_types() {
        $this->register_deity_messages();
        $this->register_fortune_templates();
        $this->register_blessing_templates();
        $this->register_sutra_content();
        $this->register_bracelet_products();
    }

    /**
     * 注册神仙消息类型
     */
    private function register_deity_messages() {
        $labels = array(
            'name' => __('神仙消息', 'zen-core'),
            'singular_name' => __('神仙消息', 'zen-core'),
            'menu_name' => __('神仙消息', 'zen-core'),
            'add_new_item' => __('添加新消息', 'zen-core'),
            'edit_item' => __('编辑消息', 'zen-core'),
            'new_item' => __('新消息', 'zen-core'),
            'view_item' => __('查看消息', 'zen-core'),
            'search_items' => __('搜索消息', 'zen-core'),
        );

        $args = array(
            'labels' => $labels,
            'public' => false,
            'show_ui' => true,
            'show_in_menu' => true,
            'show_in_admin_bar' => false,
            'show_in_rest' => true,
            'rest_base' => 'deity-messages',
            'capability_type' => 'post',
            'hierarchical' => false,
            'supports' => array('title', 'editor', 'excerpt', 'custom-fields'),
            'menu_icon' => 'dashicons-buddicons-buddypress-logo',
            'menu_position' => 25,
        );

        register_post_type('deity_message', $args);
    }

    /**
     * 注册运势模板类型
     */
    private function register_fortune_templates() {
        $labels = array(
            'name' => __('运势模板', 'zen-core'),
            'singular_name' => __('运势模板', 'zen-core'),
            'menu_name' => __('运势模板', 'zen-core'),
            'add_new_item' => __('添加新模板', 'zen-core'),
            'edit_item' => __('编辑模板', 'zen-core'),
        );

        $args = array(
            'labels' => $labels,
            'public' => false,
            'show_ui' => true,
            'show_in_menu' => true,
            'show_in_rest' => true,
            'rest_base' => 'fortune-templates',
            'supports' => array('title', 'editor', 'custom-fields'),
            'menu_icon' => 'dashicons-chart-area',
        );

        register_post_type('fortune_template', $args);
    }

    /**
     * 注册祝福模板类型
     */
    private function register_blessing_templates() {
        $labels = array(
            'name' => __('祝福模板', 'zen-core'),
            'singular_name' => __('祝福模板', 'zen-core'),
            'menu_name' => __('祝福模板', 'zen-core'),
        );

        $args = array(
            'labels' => $labels,
            'public' => false,
            'show_ui' => true,
            'show_in_menu' => true,
            'show_in_rest' => true,
            'rest_base' => 'blessing-templates',
            'supports' => array('title', 'editor', 'custom-fields'),
            'menu_icon' => 'dashicons-heart',
        );

        register_post_type('blessing_template', $args);
    }

    /**
     * 注册经典内容类型
     */
    private function register_sutra_content() {
        $labels = array(
            'name' => __('经典内容', 'zen-core'),
            'singular_name' => __('经典内容', 'zen-core'),
            'menu_name' => __('经典内容', 'zen-core'),
        );

        $args = array(
            'labels' => $labels,
            'public' => true,
            'show_ui' => true,
            'show_in_menu' => true,
            'show_in_rest' => true,
            'rest_base' => 'sutra-content',
            'supports' => array('title', 'editor', 'thumbnail', 'custom-fields'),
            'menu_icon' => 'dashicons-book',
            'has_archive' => true,
            'rewrite' => array('slug' => 'sutras'),
        );

        register_post_type('sutra_content', $args);
    }

    /**
     * 注册手串产品类型
     */
    private function register_bracelet_products() {
        $labels = array(
            'name' => __('手串产品', 'zen-core'),
            'singular_name' => __('手串产品', 'zen-core'),
            'menu_name' => __('手串产品', 'zen-core'),
        );

        $args = array(
            'labels' => $labels,
            'public' => true,
            'show_ui' => true,
            'show_in_menu' => true,
            'show_in_rest' => true,
            'rest_base' => 'bracelet-products',
            'supports' => array('title', 'editor', 'thumbnail', 'custom-fields'),
            'menu_icon' => 'dashicons-products',
            'has_archive' => true,
            'rewrite' => array('slug' => 'bracelets'),
        );

        register_post_type('bracelet_product', $args);
    }
}`
};

// 工具函数
function toPascalCase(str) {
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

function createFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

// 主要生成函数
async function generatePlugin() {
  console.log('🔧 交个神仙朋友 PWA - WordPress插件生成器');
  console.log('==========================================\n');

  const pluginType = await new Promise((resolve) => {
    rl.question(`请选择插件类型：
1. core - 核心功能插件
2. ai-integration - AI集成插件
3. nfc-manager - NFC管理插件
4. payment-gateway - 支付网关插件
5. user-management - 用户管理插件
6. custom - 自定义插件

请输入选项 (1-6): `, resolve);
  });

  const types = {
    '1': 'core',
    '2': 'ai-integration',
    '3': 'nfc-manager',
    '4': 'payment-gateway',
    '5': 'user-management',
    '6': 'custom'
  };

  const selectedType = types[pluginType];
  if (!selectedType) {
    console.log('❌ 无效的选项，请重新运行程序');
    rl.close();
    return;
  }

  const pluginName = await new Promise((resolve) => {
    rl.question('请输入插件名称: ', resolve);
  });

  const description = await new Promise((resolve) => {
    rl.question('请输入插件描述: ', resolve);
  });

  const basePath = `backend/plugins/zen-${selectedType}`;

  // 创建主插件文件
  const mainContent = pluginTemplates.mainPlugin(pluginName, description);
  createFile(`${basePath}/zen-${selectedType}.php`, mainContent);

  // 创建API控制器
  const apiContent = pluginTemplates.apiController(pluginName, description);
  createFile(`${basePath}/includes/api/class-zen-${selectedType}-api.php`, apiContent);

  // 创建激活器
  const activatorContent = pluginTemplates.activator(pluginName);
  createFile(`${basePath}/includes/class-zen-activator.php`, activatorContent);

  // 创建自定义文章类型
  const postTypesContent = pluginTemplates.postTypes(pluginName);
  createFile(`${basePath}/includes/class-zen-post-types.php`, postTypesContent);

  // 创建其他必要文件
  createOtherFiles(basePath, pluginName, selectedType);

  console.log(`\n✅ WordPress插件 ${pluginName} 创建成功！`);
  console.log(`📁 插件位置: ${basePath}/`);
  console.log('\n🔧 包含的文件：');
  console.log(`  - zen-${selectedType}.php (主插件文件)`);
  console.log(`  - includes/api/class-zen-${selectedType}-api.php (API控制器)`);
  console.log(`  - includes/class-zen-activator.php (激活器)`);
  console.log(`  - includes/class-zen-post-types.php (自定义文章类型)`);
  console.log(`  - admin/class-zen-admin.php (管理界面)`);
  console.log(`  - assets/css/admin.css (管理样式)`);
  console.log(`  - assets/js/admin.js (管理脚本)`);
  console.log('\n🌟 愿你的插件功能强大且稳定！');

  rl.close();
}

// 创建其他必要文件
function createOtherFiles(basePath, pluginName, selectedType) {
  // 管理界面类
  const adminContent = `<?php
/**
 * ${pluginName} 管理界面
 */

if (!defined('ABSPATH')) {
    exit;
}

class Zen_Admin {
    
    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'admin_init'));
    }
    
    public function add_admin_menu() {
        add_menu_page(
            '${pluginName}设置',
            '${pluginName}',
            'manage_options',
            'zen-${selectedType}',
            array($this, 'admin_page'),
            'dashicons-buddicons-buddypress-logo'
        );
    }
    
    public function admin_init() {
        register_setting('zen_${selectedType}_settings', 'zen_${selectedType}_options');
    }
    
    public function admin_page() {
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            <form action="options.php" method="post">
                <?php
                settings_fields('zen_${selectedType}_settings');
                do_settings_sections('zen_${selectedType}_settings');
                ?>
                <table class="form-table">
                    <tr>
                        <th scope="row">API密钥</th>
                        <td>
                            <input type="text" name="zen_${selectedType}_api_key" value="<?php echo esc_attr(get_option('zen_${selectedType}_api_key')); ?>" class="regular-text" />
                            <p class="description">请输入${pluginName}的API密钥</p>
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }
}`;

  createFile(`${basePath}/admin/class-zen-admin.php`, adminContent);

  // 停用器
  const deactivatorContent = `<?php
/**
 * ${pluginName} 插件停用器
 */

if (!defined('ABSPATH')) {
    exit;
}

class Zen_Deactivator {
    
    public static function deactivate() {
        // 清除定时任务
        wp_clear_scheduled_hook('zen_${selectedType}_daily_task');
        
        // 清除缓存
        wp_cache_flush();
        
        // 记录停用日志
        error_log('${pluginName} plugin deactivated');
    }
}`;

  createFile(`${basePath}/includes/class-zen-deactivator.php`, deactivatorContent);

  // 卸载器
  const uninstallerContent = `<?php
/**
 * ${pluginName} 插件卸载器
 */

if (!defined('ABSPATH')) {
    exit;
}

class Zen_Uninstaller {
    
    public static function uninstall() {
        global $wpdb;
        
        // 删除自定义表
        $tables = array(
            'zen_user_profiles',
            'zen_fortune_records',
            'zen_blessings',
            'zen_divination_records',
            'zen_nfc_bracelets'
        );
        
        foreach ($tables as $table) {
            $table_name = $wpdb->prefix . $table;
            $wpdb->query("DROP TABLE IF EXISTS {$table_name}");
        }
        
        // 删除选项
        delete_option('zen_${selectedType}_options');
        delete_option('zen_${selectedType}_api_key');
        
        // 删除用户元数据
        delete_metadata('user', 0, 'zen_bazi_data', '', true);
        delete_metadata('user', 0, 'zen_fortune_elements', '', true);
        
        // 删除自定义文章类型的文章
        $post_types = array('deity_message', 'fortune_template', 'blessing_template', 'sutra_content', 'bracelet_product');
        foreach ($post_types as $post_type) {
            $posts = get_posts(array('post_type' => $post_type, 'numberposts' => -1));
            foreach ($posts as $post) {
                wp_delete_post($post->ID, true);
            }
        }
        
        // 删除用户角色
        remove_role('zen_admin');
        remove_role('fortune_teller');
    }
}`;

  createFile(`${basePath}/includes/class-zen-uninstaller.php`, uninstallerContent);

  // 自定义分类法
  const taxonomiesContent = `<?php
/**
 * 自定义分类法注册
 */

if (!defined('ABSPATH')) {
    exit;
}

class Zen_Taxonomies {
    
    public function __construct() {
        add_action('init', array($this, 'register_taxonomies'));
    }
    
    public function register_taxonomies() {
        $this->register_fortune_category();
        $this->register_blessing_type();
        $this->register_sutra_category();
    }
    
    private function register_fortune_category() {
        register_taxonomy('fortune_category', 'fortune_template', array(
            'labels' => array(
                'name' => '运势分类',
                'singular_name' => '运势分类',
                'menu_name' => '运势分类'
            ),
            'hierarchical' => true,
            'show_ui' => true,
            'show_in_rest' => true,
            'rewrite' => array('slug' => 'fortune-category')
        ));
    }
    
    private function register_blessing_type() {
        register_taxonomy('blessing_type', 'blessing_template', array(
            'labels' => array(
                'name' => '祝福类型',
                'singular_name' => '祝福类型'
            ),
            'hierarchical' => false,
            'show_ui' => true,
            'show_in_rest' => true
        ));
    }
    
    private function register_sutra_category() {
        register_taxonomy('sutra_category', 'sutra_content', array(
            'labels' => array(
                'name' => '经典分类',
                'singular_name' => '经典分类'
            ),
            'hierarchical' => true,
            'show_ui' => true,
            'show_in_rest' => true,
            'rewrite' => array('slug' => 'sutra-category')
        ));
    }
}`;

  createFile(`${basePath}/includes/class-zen-taxonomies.php`, taxonomiesContent);

  // CSS和JS文件
  createFile(`${basePath}/assets/css/admin.css`, `/* ${pluginName} 管理样式 */
.zen-admin-page {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.zen-settings-section {
  background: #fff;
  border: 1px solid #ccd0d4;
  border-radius: 4px;
  padding: 20px;
  margin: 20px 0;
}

.zen-form-table th {
  width: 200px;
  vertical-align: top;
  padding: 15px 10px 15px 0;
}

.zen-notice {
  background: #f0f6fc;
  border-left: 4px solid #72aee6;
  margin: 5px 0 15px;
  padding: 1px 12px;
}`);

  createFile(`${basePath}/assets/js/admin.js`, `/* ${pluginName} 管理脚本 */
(function($) {
    'use strict';
    
    $(document).ready(function() {
        // 初始化管理界面
        initZenAdmin();
    });
    
    function initZenAdmin() {
        // 设置保存提示
        $('.zen-settings-form').on('submit', function() {
            const $button = $(this).find('input[type="submit"]');
            $button.val('保存中...');
        });
        
        // API密钥验证
        $('#zen_api_key').on('blur', function() {
            const apiKey = $(this).val();
            if (apiKey.length > 0 && apiKey.length < 32) {
                $(this).addClass('error');
                $(this).after('<p class="zen-error">API密钥格式不正确</p>');
            } else {
                $(this).removeClass('error');
                $(this).siblings('.zen-error').remove();
            }
        });
    }
    
})(jQuery);`);

  // package.json (如果需要)
  const packageContent = `{
  "name": "zen-${selectedType}",
  "version": "1.0.0",
  "description": "${description}",
  "main": "zen-${selectedType}.php",
  "scripts": {
    "build": "npm run build:css && npm run build:js",
    "build:css": "sass assets/scss/admin.scss:assets/css/admin.css --style compressed",
    "build:js": "webpack --mode production",
    "watch": "npm run watch:css & npm run watch:js",
    "watch:css": "sass --watch assets/scss/admin.scss:assets/css/admin.css",
    "watch:js": "webpack --mode development --watch"
  },
  "devDependencies": {
    "sass": "^1.69.0",
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.0"
  },
  "keywords": ["wordpress", "plugin", "zen", "divine-friend"],
  "author": "Divine Friend Team",
  "license": "GPL-2.0+"
}`;

  createFile(`${basePath}/package.json`, packageContent);

  // README.md
  const readmeContent = `# ${pluginName} WordPress Plugin

${description}

## 安装

1. 将插件文件上传到 \`/wp-content/plugins/zen-${selectedType}/\` 目录
2. 在WordPress管理后台激活插件
3. 在设置中配置相关参数

## 功能特性

- REST API支持
- 自定义文章类型
- 管理界面
- 数据库表管理
- 用户权限控制

## API端点

- \`GET /wp-json/zen/${selectedType}/v1/${selectedType}\` - 获取列表
- \`POST /wp-json/zen/${selectedType}/v1/${selectedType}\` - 创建项目
- \`GET /wp-json/zen/${selectedType}/v1/${selectedType}/{id}\` - 获取单项
- \`PUT /wp-json/zen/${selectedType}/v1/${selectedType}/{id}\` - 更新项目
- \`DELETE /wp-json/zen/${selectedType}/v1/${selectedType}/{id}\` - 删除项目

## 开发

\`\`\`bash
# 安装依赖
npm install

# 构建资源
npm run build

# 监听变化
npm run watch
\`\`\`

## 许可证

GPL v2 or later
`;

  createFile(`${basePath}/README.md`, readmeContent);
}

// 运行生成器
generatePlugin().catch(console.error); 