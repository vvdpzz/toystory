#config/deploy.rb
set :rails_env, :production
set :application, "toystory"
set :scm, :git
set :branch, "master"                   
set :deploy_via, :remote_cache       
set :repository,  "git://github.com/vvdpzz/toystory.git"
default_run_options[:pty] = true   

#@domain = domain rescue nil  
#set :domain, "luexiao.com" unless @domain  
 
role :web,   "106.187.43.141"                         # Your HTTP server, Apache/etc
role :app,   "106.187.43.141"                         # This may be the same as your `Web` server
role :db,    "106.187.43.141", :primary => true       # This is where Rails migrations will run
role :db,    "106.187.43.141"                         #slave db
set :deploy_to, "/root/dev/#{application}"
set :application_path, "/root/dev/#{application}/current"
set :user, "root"
set :password, "pw1234567!"

#Unicorn
set :unicorn_binary, "/usr/local/rvm/gems/ruby-1.9.2-p290/bin/unicorn"
set :unicorn_config, "#{deploy_to}/current/config/unicorn.rb"
set :unicorn_pid, "#{deploy_to}/current/tmp/pids/unicorn.pid"

namespace :deploy do
  task :start, :roles => :app, :except => { :no_release => true } do 
    run "cd #{application_path} && #{unicorn_binary} -c #{unicorn_config} -E #{rails_env} -D"
  end
  task :stop, :roles => :app, :except => { :no_release => true } do 
    run "kill `cat #{unicorn_pid}`"
  end
  task :graceful_stop, :roles => :app, :except => { :no_release => true } do
    run "kill -s QUIT `cat #{unicorn_pid}`"
  end
  task :reload, :roles => :app, :except => { :no_release => true } do
    run "kill -s USR2 `cat #{unicorn_pid}`"
  end
  task :restart, :roles => :app, :except => { :no_release => true } do
    stop
    start
  end
end
# if you're still using the script/reaper helper you will need
# these http://github.com/rails/irs_process_scripts

# If you are using Passenger mod_rails uncomment this:
# namespace :deploy do
#   task :start do ; end
#   task :stop do ; end
#   task :restart, :roles => :app, :except => { :no_release => true } do
#     run "#{try_sudo} touch #{File.join(current_path,'tmp','restart.txt')}"
#   end
# end
