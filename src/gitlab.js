var gitlab= (function(){
    var perPage = 100;

    // public methods
    function getProjects(projectCallback){
        var df = $.Deferred();
        getProjectsBase(projectCallback, df, 1);
        return df.promise();
    }

    function getProjectEvents(projectId){
        return $.ajax({
            url: config.getApiPath() + "projects/" + projectId + "/events",
            data: {
                per_page: perPage,
            },
            type: "GET",
            dataType: "json",
            headers: {
                "PRIVATE-TOKEN" : config.getPrivateToken()
            },
        });
    }

    function getEventUrl(projectEvent){
        var projects = config.getActiveProjects();
        var projectName = projects[projectEvent.project_id].name;
        return config.getGitlabPath() + projectName + getEventPath(projectEvent);
    }

    function events(){
        return [
            "Issue",
            "MergeRequest",
            "Milestone",
        ];
    }

    return {
        getProjects:      getProjects,
        getProjectEvents: getProjectEvents,
        getEventUrl:      getEventUrl,
        events:           events,
    };

    // private methods
    function getProjectsBase(projectCallback, df, page){
        $.ajax({
            url: config.getApiPath() + "projects",
            data: {
                page: page,
                per_page: perPage,
            },
            type: "GET",
            dataType: "json",
            headers: {
                "PRIVATE-TOKEN" : config.getPrivateToken()
            },
        }).fail(function(xhr, status, e){
                alert(status + " " + e);
                df.reject();
            }).done(function(projects){
                $.each(projects, function(index, project){
                    projectCallback(project);
                });

                if(projects.length < perPage){
                    // final page
                    df.resolve();
                } else{
                    // paging
                    getProjectsBase(projectCallback, df, page + 1);
                }
            });
    }

    function getEventPath(projectEvent){
        if(projectEvent.target_type == "Issue"){
            return "/issues/" + projectEvent.target_id;
        } else if(projectEvent.target_type == "MergeRequest"){
            return "/merge_requests/" + projectEvent.target_id;
        } else if(projectEvent.target_type == "Milestone"){
            return "/milestones/" + projectEvent.target_id;
        }
        return "";
    }

}());